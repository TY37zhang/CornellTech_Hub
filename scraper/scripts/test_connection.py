#!/usr/bin/env python3
"""
Database Connection Test Script
Quick test to verify your DATABASE_URL and connection setup
"""

import os
import psycopg2
from datetime import datetime

def test_database_connection():
    """Test database connection and basic operations"""
    
    # Check if DATABASE_URL is set
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL environment variable not set")
        print("Please set it with: export DATABASE_URL='your_connection_string'")
        return False
    
    try:
        print("🔍 Testing database connection...")
        print(f"Database URL: {database_url[:30]}..." if len(database_url) > 30 else database_url)
        
        # Connect to database
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        # Test basic query
        cur.execute("SELECT version();")
        db_version = cur.fetchone()
        print(f"✅ Connected to PostgreSQL: {db_version[0][:50]}...")
        
        # Check if courses table exists
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'courses'
            );
        """)
        
        table_exists = cur.fetchone()[0]
        if table_exists:
            print("✅ 'courses' table found")
            
            # Check table structure
            cur.execute("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'courses'
                ORDER BY ordinal_position;
            """)
            
            columns = cur.fetchall()
            print(f"📋 Courses table has {len(columns)} columns:")
            for col_name, col_type in columns[:10]:  # Show first 10 columns
                print(f"   - {col_name}: {col_type}")
            
            if len(columns) > 10:
                print(f"   ... and {len(columns) - 10} more columns")
            
            # Count existing courses
            cur.execute("SELECT COUNT(*) FROM courses;")
            course_count = cur.fetchone()[0]
            print(f"📊 Current courses in database: {course_count}")
            
        else:
            print("❌ 'courses' table not found - make sure your database schema is set up")
            return False
        
        # Test write permissions
        try:
            cur.execute("""
                CREATE TEMPORARY TABLE test_table (
                    id serial PRIMARY KEY,
                    test_data varchar(50),
                    created_at timestamp DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur.execute("INSERT INTO test_table (test_data) VALUES ('connection_test');")
            cur.execute("SELECT test_data FROM test_table WHERE test_data = 'connection_test';")
            result = cur.fetchone()
            
            if result and result[0] == 'connection_test':
                print("✅ Database write permissions confirmed")
            else:
                print("❌ Database write test failed")
                return False
                
        except Exception as e:
            print(f"❌ Database write test failed: {e}")
            return False
        
        cur.close()
        conn.close()
        
        print("🎉 Database connection test passed!")
        print("You're ready to run the Cornell course scraper.")
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\nTroubleshooting tips:")
        print("1. Check your DATABASE_URL format")
        print("2. Ensure the database server is running")
        print("3. Verify your credentials and permissions")
        print("4. Check network connectivity")
        return False

def main():
    print("🧪 Cornell Tech Hub - Database Connection Test")
    print("=" * 50)
    
    success = test_database_connection()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ All tests passed! You can now run the scraper.")
    else:
        print("❌ Tests failed. Please fix the issues above before running the scraper.")

if __name__ == "__main__":
    main() 