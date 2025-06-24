#!/usr/bin/env python3
"""
Database Updater for Cornell Tech Course Data
Reads scraped course data from JSON/CSV files and updates the database
"""

import json
import csv
import psycopg2
import os
import sys
from datetime import datetime
from typing import List, Dict, Optional
import logging
import argparse

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CourseDataUpdater:
    def __init__(self, database_url: str):
        self.database_url = database_url
        
    def connect_to_db(self):
        """Connect to PostgreSQL database"""
        try:
            conn = psycopg2.connect(self.database_url)
            return conn
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise

    def load_from_json(self, filename: str) -> List[Dict]:
        """Load course data from JSON file"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                courses = json.load(f)
            logger.info(f"Loaded {len(courses)} courses from {filename}")
            return courses
        except Exception as e:
            logger.error(f"Failed to load JSON file {filename}: {e}")
            return []

    def load_from_csv(self, filename: str) -> List[Dict]:
        """Load course data from CSV file"""
        try:
            courses = []
            with open(filename, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Convert credits to int
                    if row.get('credits'):
                        try:
                            row['credits'] = int(row['credits'])
                        except ValueError:
                            row['credits'] = 3  # Default
                    
                    # Convert year to int
                    if row.get('year'):
                        try:
                            row['year'] = int(row['year'])
                        except ValueError:
                            row['year'] = 2025  # Default
                    
                    courses.append(row)
                    
            logger.info(f"Loaded {len(courses)} courses from {filename}")
            return courses
        except Exception as e:
            logger.error(f"Failed to load CSV file {filename}: {e}")
            return []

    def validate_course_data(self, course: Dict) -> bool:
        """Validate that course data has required fields"""
        required_fields = ['code', 'name', 'department', 'credits', 'semester', 'year']
        
        for field in required_fields:
            if not course.get(field):
                logger.warning(f"Course missing required field '{field}': {course}")
                return False
        
        return True

    def insert_courses_to_db(self, courses: List[Dict], update_existing: bool = True):
        """Insert courses into the database"""
        if not courses:
            logger.warning("No courses to insert")
            return
            
        conn = self.connect_to_db()
        cur = conn.cursor()
        
        try:
            inserted_count = 0
            updated_count = 0
            skipped_count = 0
            
            for course in courses:
                try:
                    # Validate course data
                    if not self.validate_course_data(course):
                        skipped_count += 1
                        continue
                    
                    # Check if course already exists
                    cur.execute("""
                        SELECT id FROM courses 
                        WHERE code = %s AND semester = %s AND year = %s
                    """, (course['code'], course['semester'], course['year']))
                    
                    existing = cur.fetchone()
                    
                    if existing:
                        if update_existing:
                            # Update existing course
                            cur.execute("""
                                UPDATE courses 
                                SET name = %s, description = %s, credits = %s, department = %s,
                                    professor_id = %s, full_code = %s, updated_at = %s
                                WHERE code = %s AND semester = %s AND year = %s
                            """, (
                                course['name'], 
                                course.get('description', ''), 
                                course['credits'],
                                course['department'], 
                                course.get('professor_id', 'Staff'), 
                                course.get('full_code', course['code']),
                                datetime.now(), 
                                course['code'], 
                                course['semester'], 
                                course['year']
                            ))
                            updated_count += 1
                            logger.info(f"Updated course: {course['code']} - {course['name']}")
                        else:
                            logger.info(f"Skipped existing course: {course['code']} - {course['name']}")
                            skipped_count += 1
                    else:
                        # Insert new course
                        cur.execute("""
                            INSERT INTO courses (code, name, description, credits, department, 
                                               semester, year, professor_id, full_code, created_at, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            course['code'], 
                            course['name'], 
                            course.get('description', ''),
                            course['credits'], 
                            course['department'], 
                            course['semester'],
                            course['year'], 
                            course.get('professor_id', 'Staff'), 
                            course.get('full_code', course['code']),
                            datetime.now(), 
                            datetime.now()
                        ))
                        inserted_count += 1
                        logger.info(f"Inserted course: {course['code']} - {course['name']}")
                    
                except Exception as e:
                    logger.error(f"Failed to process course {course.get('code', 'Unknown')}: {e}")
                    skipped_count += 1
                    continue
            
            conn.commit()
            
            # Print summary
            logger.info("=" * 50)
            logger.info("DATABASE UPDATE SUMMARY")
            logger.info("=" * 50)
            logger.info(f"✅ Courses inserted: {inserted_count}")
            logger.info(f"🔄 Courses updated: {updated_count}")
            logger.info(f"⏭️  Courses skipped: {skipped_count}")
            logger.info(f"📊 Total processed: {inserted_count + updated_count + skipped_count}")
            
        except Exception as e:
            conn.rollback()
            logger.error(f"Database operation failed: {e}")
            raise
        finally:
            cur.close()
            conn.close()

    def preview_changes(self, courses: List[Dict]):
        """Preview what changes would be made without actually updating the database"""
        if not courses:
            logger.warning("No courses to preview")
            return
            
        conn = self.connect_to_db()
        cur = conn.cursor()
        
        try:
            new_courses = []
            existing_courses = []
            invalid_courses = []
            
            for course in courses:
                if not self.validate_course_data(course):
                    invalid_courses.append(course)
                    continue
                    
                # Check if course already exists
                cur.execute("""
                    SELECT id, name, description, professor_id FROM courses 
                    WHERE code = %s AND semester = %s AND year = %s
                """, (course['code'], course['semester'], course['year']))
                
                existing = cur.fetchone()
                
                if existing:
                    existing_courses.append({
                        'course': course,
                        'existing': existing
                    })
                else:
                    new_courses.append(course)
            
            # Print preview
            logger.info("=" * 60)
            logger.info("DATABASE UPDATE PREVIEW")
            logger.info("=" * 60)
            
            if new_courses:
                logger.info(f"\n📝 NEW COURSES TO BE INSERTED ({len(new_courses)}):")
                for course in new_courses:
                    logger.info(f"   + {course['code']} - {course['name']}")
            
            if existing_courses:
                logger.info(f"\n🔄 EXISTING COURSES TO BE UPDATED ({len(existing_courses)}):")
                for item in existing_courses:
                    course = item['course']
                    existing = item['existing']
                    logger.info(f"   • {course['code']} - {course['name']}")
                    if course['name'] != existing[1]:
                        logger.info(f"     Name: '{existing[1]}' → '{course['name']}'")
                    if course.get('professor_id', 'Staff') != existing[3]:
                        logger.info(f"     Professor: '{existing[3]}' → '{course.get('professor_id', 'Staff')}'")
            
            if invalid_courses:
                logger.info(f"\n❌ INVALID COURSES TO BE SKIPPED ({len(invalid_courses)}):")
                for course in invalid_courses:
                    logger.info(f"   × {course.get('code', 'NO CODE')} - Missing required fields")
            
            logger.info("\n" + "=" * 60)
            logger.info(f"Total: {len(new_courses)} new, {len(existing_courses)} updates, {len(invalid_courses)} invalid")
            
        except Exception as e:
            logger.error(f"Preview failed: {e}")
            raise
        finally:
            cur.close()
            conn.close()

def main():
    """Main function with command line argument parsing"""
    parser = argparse.ArgumentParser(description='Update database with Cornell course data')
    parser.add_argument('input_file', help='Input file (JSON or CSV)')
    parser.add_argument('--preview', action='store_true', help='Preview changes without updating')
    parser.add_argument('--no-update', action='store_true', help='Don\'t update existing courses')
    parser.add_argument('--database-url', help='Database URL (or use DATABASE_URL env var)')
    
    args = parser.parse_args()
    
    # Get database URL
    database_url = args.database_url or os.getenv('DATABASE_URL')
    if not database_url:
        logger.error("DATABASE_URL not provided. Use --database-url or set DATABASE_URL environment variable")
        sys.exit(1)
    
    # Check if input file exists
    if not os.path.exists(args.input_file):
        logger.error(f"Input file '{args.input_file}' not found")
        sys.exit(1)
    
    # Initialize updater
    updater = CourseDataUpdater(database_url)
    
    try:
        # Load course data
        if args.input_file.endswith('.json'):
            courses = updater.load_from_json(args.input_file)
        elif args.input_file.endswith('.csv'):
            courses = updater.load_from_csv(args.input_file)
        else:
            logger.error("Input file must be .json or .csv")
            sys.exit(1)
        
        if not courses:
            logger.error("No courses loaded from input file")
            sys.exit(1)
        
        # Preview or update
        if args.preview:
            updater.preview_changes(courses)
        else:
            update_existing = not args.no_update
            updater.insert_courses_to_db(courses, update_existing=update_existing)
            
    except Exception as e:
        logger.error(f"Update failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 