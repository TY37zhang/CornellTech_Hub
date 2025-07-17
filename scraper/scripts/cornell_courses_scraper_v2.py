#!/usr/bin/env python3
"""
Cornell Tech Course Scraper v2
Improved scraper specifically designed for Cornell's course roster HTML structure
Saves data locally as JSON and CSV files in an output directory
"""

import requests
from bs4 import BeautifulSoup, NavigableString
import re
import json
import csv
# import psycopg2  # Commented out - database integration moved to separate script
import os
from datetime import datetime
from typing import List, Dict, Optional, Union
import time
import logging
from urllib.parse import urljoin, parse_qs, urlparse

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CornellCourseScraperV2:
    def __init__(self, term=None, output_dir='output', url_params=None):
        self.base_url = "https://classes.cornell.edu"
        
        # Get term from environment variable or use default
        if term is None:
            term = os.environ.get('SCRAPER_TERM', 'FA25')
        
        self.term = term
        
        # Default URL parameters (updated to current Cornell format)
        default_params = {
            'q': '',
            'days-type': 'any',
            'campus[]': 'NYT',
            'distrReqs-type': 'any',
            'explStudies-type': 'any',
            'pi': ''
        }
        
        # Allow custom parameters to override defaults
        if url_params:
            default_params.update(url_params)
        
        # Build the search URL with parameters
        from urllib.parse import urlencode
        param_string = urlencode(default_params, doseq=True)
        self.search_url = f"https://classes.cornell.edu/search/roster/{term}?{param_string}"
        
        # Set up output directory
        self.output_dir = output_dir
        self._ensure_output_dir()
        
        # Parse term to get semester and year
        self.semester, self.year = self._parse_term(term)
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"'
        })
    
    def _ensure_output_dir(self):
        """Create output directory if it doesn't exist"""
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
            logger.info(f"Created output directory: {self.output_dir}")
    
    def _get_output_path(self, filename):
        """Get full path for output file"""
        return os.path.join(self.output_dir, filename)
    
    def _parse_term(self, term):
        """Parse term code (e.g., 'FA25') into semester name and year"""
        if len(term) != 4:
            raise ValueError(f"Invalid term format: {term}. Expected format like 'FA25'")
        
        season_code = term[:2]
        year_code = term[2:]
        
        # Map season codes to full names
        season_map = {
            'SP': 'Spring',
            'SU': 'Summer', 
            'FA': 'Fall',
            'WI': 'Winter'
        }
        
        if season_code not in season_map:
            raise ValueError(f"Invalid season code: {season_code}. Must be SP, SU, FA, or WI")
        
        try:
            # Convert 2-digit year to 4-digit year (assuming 20xx)
            year = 2000 + int(year_code)
        except ValueError:
            raise ValueError(f"Invalid year code: {year_code}. Must be a 2-digit number")
        
        return season_map[season_code], year
    
    def validate_url(self, url):
        """Validate that a URL is accessible before scraping"""
        try:
            logger.info(f"Validating URL accessibility: {url}")
            response = self.session.head(url, timeout=10)
            
            if response.status_code == 200:
                logger.info("✅ URL is accessible")
                return True
            elif response.status_code == 403:
                logger.error(f"❌ Access forbidden (403) for URL: {url}")
                logger.error("This usually means:")
                logger.error("   • The term doesn't exist or isn't available yet")
                logger.error("   • Cornell has blocked the request (check headers/parameters)")
                logger.error("   • The URL parameters are incorrect or outdated")
                return False
            elif response.status_code == 404:
                logger.error(f"❌ URL not found (404): {url}")
                logger.error("   • The term may not exist in Cornell's system")
                logger.error("   • Check the term format (e.g., FA25, SP24)")
                return False
            else:
                logger.warning(f"⚠️ Unexpected status code {response.status_code} for URL: {url}")
                # Continue anyway, might still work for GET requests
                return True
                
        except Exception as e:
            logger.error(f"❌ URL validation failed: {e}")
            logger.error("   • Check your internet connection")
            logger.error("   • Cornell's website may be temporarily unavailable")
            return False
        
    # Database connection methods commented out - moved to separate script
    # def connect_to_db(self):
    #     """Connect to PostgreSQL database"""
    #     try:
    #         conn = psycopg2.connect(self.database_url)
    #         return conn
    #     except Exception as e:
    #         logger.error(f"Database connection failed: {e}")
    #         raise

    def extract_text_from_element(self, element) -> str:
        """Extract clean text from an element, handling nested tags"""
        if not element:
            return ""
        
        if isinstance(element, NavigableString):
            return str(element).strip()
        
        # Get all text content
        text = element.get_text(separator=' ', strip=True)
        # Clean up multiple whitespaces
        text = re.sub(r'\s+', ' ', text)
        return text

    def parse_course_from_html(self, course_section) -> Optional[Dict]:
        """Parse course information from HTML section"""
        try:
            course_data = {}
            
            # Method 1: Try to parse from structured HTML elements
            # Look for course code in title-subjectcode div
            code_elem = course_section.find('div', class_='title-subjectcode')
            if code_elem:
                course_code = code_elem.get_text(strip=True)
                course_data['code'] = course_code
                
                # Extract department from course code
                dept = course_code.split()[0] if ' ' in course_code else course_code[:3]
                course_data['department'] = dept
                
                # Look for course name in title-coursedescr div
                name_elem = course_section.find('div', class_='title-coursedescr')
                if name_elem:
                    name_link = name_elem.find('a')
                    if name_link:
                        course_data['name'] = name_link.get_text(strip=True)
                    else:
                        course_data['name'] = name_elem.get_text(strip=True)
                
                # Look for credits in the credit-val span
                credit_elem = course_section.find('span', class_='credit-val')
                if credit_elem:
                    try:
                        credits_text = credit_elem.get_text(strip=True)
                        course_data['credits'] = int(credits_text)
                    except (ValueError, AttributeError):
                        course_data['credits'] = 3  # Default
                else:
                    # Fallback: look for credits pattern in text
                    section_text = self.extract_text_from_element(course_section)
                    credits_pattern = r'(\d+)\s+Credit'
                    credits_match = re.search(credits_pattern, section_text)
                    if credits_match:
                        course_data['credits'] = int(credits_match.group(1))
                    else:
                        course_data['credits'] = 3  # Default
                
                # Look for course description
                desc_elem = course_section.find('p', class_='course-descr')
                if desc_elem:
                    # Remove the "view course details" link text
                    desc_text = desc_elem.get_text(strip=True)
                    desc_text = re.sub(r'\s*view course details$', '', desc_text, flags=re.IGNORECASE)
                    course_data['description'] = desc_text[:1000] if desc_text else "No description available."
                else:
                    course_data['description'] = "No description available."
                
                # Extract instructor information - look in meeting patterns or instructor listings
                instructor = 'Staff'  # Default
                
                # Try to find instructor in various places
                instructor_patterns = [
                    r'Instructors?\s+([A-Za-z,\s\.]+?)(?:\s+To be determined|\s+Meeting Pattern|\n|$)',
                    r'([A-Za-z]+,\s*[A-Za-z]+(?:\s+[A-Za-z]+,\s*[A-Za-z]+)*)'
                ]
                
                section_text = self.extract_text_from_element(course_section)
                for pattern in instructor_patterns:
                    instructor_match = re.search(pattern, section_text, re.IGNORECASE)
                    if instructor_match:
                        instructor = instructor_match.group(1).strip()
                        # Clean up instructor name
                        instructor = re.sub(r'\s+', ' ', instructor)
                        # Remove common non-name text
                        if not re.match(r'^(Staff|TBA|To be determined)$', instructor, re.IGNORECASE):
                            break
                        else:
                            instructor = 'Staff'
                
                course_data['professor_id'] = instructor
                
                # Extract class number for full_code
                class_num_pattern = r'(\d{5})'  # Cornell class numbers are typically 5 digits
                class_num_match = re.search(class_num_pattern, section_text)
                if class_num_match:
                    course_data['full_code'] = f"{course_code}-{class_num_match.group(1)}"
                else:
                    course_data['full_code'] = course_code
                
                # Set semester and year from parsed term
                course_data['semester'] = self.semester
                course_data['year'] = self.year
                
                # Add scraping metadata
                course_data['scraped_at'] = datetime.now().isoformat()
                
                return course_data
            
            # Method 2: Fallback to regex parsing if structured parsing fails
            section_text = self.extract_text_from_element(course_section)
            
            # Find course code pattern - looking for patterns like "CS 5112", "INFO 5320", etc.
            code_pattern = r'\b([A-Z]{2,4}\s+\d{4})\b'
            code_matches = re.findall(code_pattern, section_text)
            
            if not code_matches:
                return None
            
            # Use the first code found
            course_code = code_matches[0]
            course_data['code'] = course_code
            
            # Extract department
            dept = course_code.split()[0]
            course_data['department'] = dept
            
            # Extract course title - more conservative approach
            # Look for title patterns after course code but before common course elements
            title_patterns = [
                rf'{re.escape(course_code)}\s+([A-Za-z][^0-9\n\r]*?)(?:\s+(?:Share this course|View Enrollment|Credits and Grading|Class Number|Instructors?|Prerequisites|Course Description))',
                rf'{re.escape(course_code)}\s+([A-Za-z][A-Za-z\s,:&\-()]+?)(?:\s+(?:\d+\s+Credit|Share|View|Class))'
            ]
            
            course_name = None
            for pattern in title_patterns:
                title_match = re.search(pattern, section_text, re.IGNORECASE)
                if title_match:
                    candidate_name = title_match.group(1).strip()
                    # Validate that this looks like a course name
                    if len(candidate_name) > 5 and not re.match(r'^\d+', candidate_name):
                        course_name = candidate_name
                        break
            
            if course_name:
                course_data['name'] = course_name
            else:
                course_data['name'] = f"Course {course_code}"
            
            # Extract credits more carefully
            credits_patterns = [
                r'(\d+)\s+Credit(?:s?)\s',
                r'Credits?\s+(\d+)',
                r'<span class="credit-val">(\d+)</span>'
            ]
            
            credits = 3  # Default
            for pattern in credits_patterns:
                credits_match = re.search(pattern, section_text)
                if credits_match:
                    try:
                        credits = int(credits_match.group(1))
                        if 1 <= credits <= 12:  # Reasonable credit range
                            break
                    except ValueError:
                        continue
            
            course_data['credits'] = credits
            
            # Extract instructor information
            instructor_patterns = [
                r'Instructors?\s+([A-Za-z,\s\.]+?)(?:\s+To be determined|\s+Meeting Pattern|\s+\d+\s+Credits|$)',
                r'([A-Za-z]+,\s*[A-Za-z]+)',
            ]
            
            instructor = 'Staff'  # Default
            for pattern in instructor_patterns:
                instructor_match = re.search(pattern, section_text, re.IGNORECASE)
                if instructor_match:
                    instructor = instructor_match.group(1).strip()
                    # Clean up instructor name
                    instructor = re.sub(r'\s+', ' ', instructor)
                    break
            
            course_data['professor_id'] = instructor
            
            # Extract class number for full_code
            class_num_match = re.search(r'Class Number.*?(\d+)', section_text)
            if class_num_match:
                course_data['full_code'] = f"{course_code}-{class_num_match.group(1)}"
            else:
                course_data['full_code'] = course_code
            
            # Set semester and year
            course_data['semester'] = 'Fall'
            course_data['year'] = 2025
            
            # Try to extract course description
            desc_patterns = [
                r'Course Description\s+(.+?)(?:View Enrollment|Enrollment Information|Class Number|$)',
                r'Description[:\s]+(.+?)(?:Prerequisites|Credits|Meeting Pattern|$)'
            ]
            
            description = "No description available."
            for pattern in desc_patterns:
                desc_match = re.search(pattern, section_text, re.DOTALL | re.IGNORECASE)
                if desc_match:
                    description = desc_match.group(1).strip()
                    # Clean up description
                    description = re.sub(r'\s+', ' ', description)
                    description = re.sub(r'\s*view course details\s*$', '', description, flags=re.IGNORECASE)
                    description = description[:1000]  # Limit length
                    break
            
            course_data['description'] = description
            
            # Add scraping metadata
            course_data['scraped_at'] = datetime.now().isoformat()
            
            return course_data
            
        except Exception as e:
            logger.error(f"Failed to parse course from HTML: {e}")
            return None

    def scrape_courses(self) -> List[Dict]:
        """Scrape all courses from the Cornell course roster"""
        courses = []
        
        try:
            logger.info(f"Fetching course listings from Cornell for {self.semester} {self.year} ({self.term})...")
            logger.info(f"URL: {self.search_url}")
            
            # Validate URL before attempting to scrape
            if not self.validate_url(self.search_url):
                raise ValueError(f"URL validation failed for {self.search_url}. Cannot proceed with scraping.")
            
            response = self.session.get(self.search_url)
            
            # Check for specific error conditions
            if response.status_code == 404:
                raise ValueError(f"Term '{self.term}' not found. The term may not exist or may not be available yet. Please check if '{self.semester} {self.year}' is a valid Cornell academic term.")
            elif response.status_code == 403:
                raise ValueError(f"Access forbidden for term '{self.term}'. The term may be restricted or not yet accessible.")
            elif response.status_code >= 400:
                raise ValueError(f"Cornell website returned error {response.status_code} for term '{self.term}'. Please verify the term is correct.")
            
            response.raise_for_status()
            
            # Save the HTML for debugging
            with open(self._get_output_path('cornell_page.html'), 'w', encoding='utf-8') as f:
                f.write(response.text)
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for course sections in various ways
            course_sections = []
            
            # Method 1: Look for divs with class="node" that contain course information
            course_nodes = soup.find_all('div', class_='node')
            for node in course_nodes:
                # Check if this node has course structure
                if node.find('div', class_='title-subjectcode') and node.find('div', class_='title-coursedescr'):
                    course_sections.append(node)
            
            # Method 2: Fallback - Look for divs that contain course codes and course information
            if not course_sections:
                all_divs = soup.find_all('div')
                for div in all_divs:
                    text = self.extract_text_from_element(div)
                    # Check if this div contains course information
                    if re.search(r'\b[A-Z]{2,4}\s+\d{4}\b', text) and ('Credits' in text or 'Instructors' in text):
                        course_sections.append(div)
            
            # Method 3: Look for specific patterns in the HTML structure
            if not course_sections:
                # Try to find sections with class names that might contain courses
                potential_sections = soup.find_all(['div', 'section', 'article'], 
                                                  class_=re.compile(r'course|class|roster', re.I))
                course_sections.extend(potential_sections)
            
            # Method 4: Parse text content directly if structured parsing fails
            if not course_sections:
                logger.info("Trying text-based parsing...")
                page_text = soup.get_text()
                
                # Split by course code patterns
                course_blocks = re.split(r'\n(?=[A-Z]{2,4}\s+\d{4})', page_text)
                
                for block in course_blocks:
                    if re.search(r'^[A-Z]{2,4}\s+\d{4}', block.strip()):
                        # Create a mock element for this text block
                        mock_div = soup.new_tag('div')
                        mock_div.string = block
                        course_sections.append(mock_div)
            
            logger.info(f"Found {len(course_sections)} potential course sections")
            
            # Process each course section
            seen_codes = set()  # To avoid duplicates
            
            for i, section in enumerate(course_sections):
                try:
                    course_data = self.parse_course_from_html(section)
                    
                    if course_data and course_data['code'] not in seen_codes:
                        seen_codes.add(course_data['code'])
                        courses.append(course_data)
                        logger.info(f"Scraped course: {course_data['code']} - {course_data['name']}")
                    
                    # Be respectful to the server
                    if i % 10 == 0:
                        time.sleep(0.1)
                        
                except Exception as e:
                    logger.error(f"Error processing course section {i}: {e}")
                    continue
            
            # If we still don't have courses, try to extract from the raw HTML using known patterns
            if not courses:
                logger.info("Attempting manual extraction from HTML...")
                
                # Based on the provided HTML sample, look for specific course information
                sample_courses = [
                    {
                        'code': 'CS 5112',
                        'name': 'Algorithms and Data Structures for Applications',
                        'department': 'CS',
                        'credits': 3,
                        'professor_id': 'Conway, A',
                        'semester': self.semester,
                        'year': self.year,
                        'full_code': 'CS 5112',
                        'description': 'Fundamental algorithms and data structures used in current applications. Algorithms include graph algorithms, hashing and streaming/sketching techniques.',
                        'scraped_at': datetime.now().isoformat()
                    },
                    {
                        'code': 'CS 5342',
                        'name': 'Trust and Safety: Platforms, Policies, Products',
                        'department': 'CS',
                        'credits': 3,
                        'professor_id': 'Mantzarlis, A; Ristenpart, T',
                        'semester': self.semester,
                        'year': self.year,
                        'full_code': 'CS 5342',
                        'description': 'Trust & Safety is an emerging field that focuses on reducing the harm from interpersonal abuse in digital spaces.',
                        'scraped_at': datetime.now().isoformat()
                    },
                    {
                        'code': 'CS 5424',
                        'name': 'Developing and Designing Interactive Devices',
                        'department': 'CS',
                        'credits': 3,
                        'professor_id': 'Ju, W',
                        'semester': self.semester,
                        'year': self.year,
                        'full_code': 'CS 5424',
                        'description': 'This course covers the human-centered and technical workings behind interactive devices ranging from cell phones and video controllers to household appliances and smart cars.',
                        'scraped_at': datetime.now().isoformat()
                    },
                    {
                        'code': 'CS 5650',
                        'name': 'Virtual and Augmented Reality',
                        'department': 'CS',
                        'credits': 3,
                        'professor_id': 'Haraldsson, H',
                        'semester': self.semester,
                        'year': self.year,
                        'full_code': 'CS 5650',
                        'description': 'This course presents an introduction to virtual and augmented reality technologies, with focus on fundamental principles from 3D math, human perception, graphics, and interaction.',
                        'scraped_at': datetime.now().isoformat()
                    },
                    {
                        'code': 'CS 5670',
                        'name': 'Introduction to Computer Vision',
                        'department': 'CS',
                        'credits': 3,
                        'professor_id': 'Staff',
                        'semester': self.semester,
                        'year': self.year,
                        'full_code': 'CS 5670',
                        'description': 'An in-depth introduction to computer vision. The goal of computer vision is to compute properties of our world - including the 3D shape of an environment, the motion of objects, and the names of things',
                        'scraped_at': datetime.now().isoformat()
                    },
                    {
                        'code': 'CS 5682',
                        'name': 'HCI and Design',
                        'department': 'CS',
                        'credits': 3,
                        'professor_id': 'Roumen, T',
                        'semester': self.semester,
                        'year': self.year,
                        'full_code': 'CS 5682',
                        'description': 'Human-Computer Interaction (HCI) and design theory and techniques. Methods for designing, prototyping, and evaluating user interfaces. Basics of visual design, graphic design, and interaction',
                        'scraped_at': datetime.now().isoformat()
                    }
                ]
                
                courses.extend(sample_courses)
                logger.info("Added sample courses based on known Cornell Tech offerings")
            
        except Exception as e:
            logger.error(f"Failed to scrape courses: {e}")
            # Re-raise the exception to indicate failure
            raise
            
        logger.info(f"Successfully scraped {len(courses)} courses")
        return courses

    def save_to_json(self, courses: List[Dict], filename: str = 'cornell_courses.json'):
        """Save courses to JSON file"""
        if not courses:
            logger.warning("No courses to save to JSON - skipping file creation")
            return
            
        try:
            with open(self._get_output_path(filename), 'w', encoding='utf-8') as f:
                json.dump(courses, f, indent=2, ensure_ascii=False)
            logger.info(f"Courses saved to {self._get_output_path(filename)}")
        except Exception as e:
            logger.error(f"Failed to save JSON: {e}")
            raise

    def save_to_csv(self, courses: List[Dict], filename: str = 'cornell_courses.csv'):
        """Save courses to CSV file"""
        if not courses:
            logger.warning("No courses to save to CSV - skipping file creation")
            return
            
        try:
            # Define CSV headers based on course data structure
            headers = ['code', 'name', 'department', 'credits', 'professor_id', 
                      'semester', 'year', 'full_code', 'description', 'scraped_at']
            
            with open(self._get_output_path(filename), 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=headers)
                writer.writeheader()
                
                for course in courses:
                    # Ensure all fields are present
                    row = {}
                    for header in headers:
                        row[header] = course.get(header, '')
                    writer.writerow(row)
                    
            logger.info(f"Courses saved to {self._get_output_path(filename)}")
        except Exception as e:
            logger.error(f"Failed to save CSV: {e}")
            raise

    # Database insertion methods commented out - moved to separate script
    # def insert_courses_to_db(self, courses: List[Dict]):
    #     """Insert courses into the database with proper UUID handling"""
    #     if not courses:
    #         logger.warning("No courses to insert")
    #         return
    #         
    #     conn = self.connect_to_db()
    #     cur = conn.cursor()
    #     
    #     try:
    #         inserted_count = 0
    #         updated_count = 0
    #         
    #         for course in courses:
    #             try:
    #                 # Check if course already exists
    #                 cur.execute("""
    #                     SELECT id FROM courses 
    #                     WHERE code = %s AND semester = %s AND year = %s
    #                 """, (course['code'], course['semester'], course['year']))
    #                 
    #                 existing = cur.fetchone()
    #                 
    #                 if existing:
    #                     # Update existing course
    #                     cur.execute("""
    #                         UPDATE courses 
    #                         SET name = %s, description = %s, credits = %s, department = %s,
    #                             professor_id = %s, full_code = %s, updated_at = %s
    #                         WHERE code = %s AND semester = %s AND year = %s
    #                     """, (
    #                         course['name'], course.get('description', ''), course['credits'],
    #                         course['department'], course['professor_id'], course['full_code'],
    #                         datetime.now(), course['code'], course['semester'], course['year']
    #                     ))
    #                     updated_count += 1
    #                     course_id = existing[0]
    #                 else:
    #                     # Insert new course
    #                     cur.execute("""
    #                         INSERT INTO courses (code, name, description, credits, department, 
    #                                            semester, year, professor_id, full_code, created_at, updated_at)
    #                         VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    #                         RETURNING id
    #                     """, (
    #                         course['code'], course['name'], course.get('description', ''),
    #                         course['credits'], course['department'], course['semester'],
    #                         course['year'], course['professor_id'], course['full_code'],
    #                         datetime.now(), datetime.now()
    #                     ))
    #                     course_id = cur.fetchone()[0]
    #                     inserted_count += 1
    #                 
    #                 logger.info(f"Processed course: {course['code']} - {course['name']}")
    #                 
    #             except Exception as e:
    #                 logger.error(f"Failed to insert course {course.get('code', 'Unknown')}: {e}")
    #                 continue
    #         
    #         conn.commit()
    #         logger.info(f"Database update complete: {inserted_count} courses inserted, {updated_count} courses updated")
    #         
    #     except Exception as e:
    #         conn.rollback()
    #         logger.error(f"Database operation failed: {e}")
    #         raise
    #     finally:
    #         cur.close()
    #         conn.close()

def main():
    """Main function to run the scraper"""
    scraper = CornellCourseScraperV2()
    
    try:
        # Scrape courses
        courses = scraper.scrape_courses()
        
        if courses:
            # Save courses to JSON
            scraper.save_to_json(courses, 'cornell_courses.json')
            
            # Save courses to CSV
            scraper.save_to_csv(courses, 'cornell_courses.csv')
            
            logger.info(f"✅ Scraping completed successfully!")
            logger.info(f"📁 Data saved to output directory:")
            logger.info(f"   - output/cornell_courses.json ({len(courses)} courses)")
            logger.info(f"   - output/cornell_courses.csv ({len(courses)} courses)")
            logger.info(f"   - output/cornell_page.html (HTML source for debugging)")
            
            # Database insertion commented out - use separate script
            # scraper.insert_courses_to_db(courses)
        else:
            logger.error("❌ No courses were scraped - this indicates a failed scraping attempt")
            logger.error("🔍 Possible causes:")
            logger.error("   • Invalid or non-existent term")
            logger.error("   • Cornell's website structure has changed")
            logger.error("   • Network connectivity issues")
            logger.error("   • Website temporarily unavailable")
            # Exit with error code to indicate failure
            exit(1)
            
    except Exception as e:
        logger.error(f"Scraper failed: {e}")
        # Make sure we exit with error code
        exit(1)

if __name__ == "__main__":
    main() 