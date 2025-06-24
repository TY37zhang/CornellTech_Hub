#!/usr/bin/env python3
"""
Scraper Test Script
Quick test to verify the scraper functionality without database connection
"""

import json
import csv
import os
from cornell_courses_scraper_v2 import CornellCourseScraperV2

def test_scraper():
    """Test the scraper functionality"""
    
    print("🧪 Cornell Course Scraper Test")
    print("=" * 40)
    
    # Initialize scraper
    scraper = CornellCourseScraperV2()
    
    # Test scraping
    print("🔍 Testing course scraping...")
    courses = scraper.scrape_courses()
    
    if not courses:
        print("❌ No courses scraped")
        return False
    
    print(f"✅ Scraped {len(courses)} courses")
    
    # Test JSON export
    print("📄 Testing JSON export...")
    try:
        scraper.save_to_json(courses, 'test_courses.json')
        
        # Verify JSON file
        with open('test_courses.json', 'r') as f:
            loaded_courses = json.load(f)
        
        if len(loaded_courses) == len(courses):
            print("✅ JSON export successful")
        else:
            print("❌ JSON export failed - course count mismatch")
            return False
            
    except Exception as e:
        print(f"❌ JSON export failed: {e}")
        return False
    
    # Test CSV export
    print("📊 Testing CSV export...")
    try:
        scraper.save_to_csv(courses, 'test_courses.csv')
        
        # Verify CSV file
        csv_courses = []
        with open('test_courses.csv', 'r') as f:
            reader = csv.DictReader(f)
            csv_courses = list(reader)
        
        if len(csv_courses) == len(courses):
            print("✅ CSV export successful")
        else:
            print("❌ CSV export failed - course count mismatch")
            return False
            
    except Exception as e:
        print(f"❌ CSV export failed: {e}")
        return False
    
    # Display sample course data
    print("\n📋 Sample Course Data:")
    print("-" * 40)
    sample_course = courses[0]
    for key, value in sample_course.items():
        print(f"  {key}: {value}")
    
    # Cleanup test files
    try:
        os.remove('test_courses.json')
        os.remove('test_courses.csv')
        print("\n🧹 Cleaned up test files")
    except:
        pass
    
    print("\n🎉 All tests passed!")
    return True

def main():
    success = test_scraper()
    
    if success:
        print("\n✅ Scraper is working correctly!")
        print("Run the full scraper with: python3 cornell_courses_scraper_v2.py")
    else:
        print("\n❌ Scraper test failed!")

if __name__ == "__main__":
    main() 