#!/bin/bash

# Cornell Course Scraper Setup and Run Script

# Parse command line arguments
FORCE_CLEANUP=false
SKIP_CLEANUP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --force-cleanup)
            FORCE_CLEANUP=true
            shift
            ;;
        --skip-cleanup)
            SKIP_CLEANUP=true
            shift
            ;;
        --help)
            echo "Cornell Tech Course Scraper"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --force-cleanup    Always remove virtual environment at the end"
            echo "  --skip-cleanup     Never remove virtual environment at the end"
            echo "  --help            Show this help message"
            echo ""
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "🎯 Cornell Tech Course Scraper"
echo "================================"

# Get current year for default suggestions
CURRENT_YEAR=$(date +%Y)
NEXT_YEAR=$((CURRENT_YEAR + 1))

# Ask user to select term
echo "📅 Select Academic Term:"
echo "   Format: [Season][2-digit year]"
echo "   - Spring: SP (e.g., SP24 for Spring 2024)"
echo "   - Summer: SU (e.g., SU24 for Summer 2024)"  
echo "   - Fall: FA (e.g., FA25 for Fall 2025)"
echo "   - Winter: WI (e.g., WI25 for Winter 2025)"
echo ""
echo "   Common terms:"
echo "   - SP$(echo $CURRENT_YEAR | tail -c 3) (Spring $CURRENT_YEAR)"
echo "   - SU$(echo $CURRENT_YEAR | tail -c 3) (Summer $CURRENT_YEAR)"
echo "   - FA$(echo $NEXT_YEAR | tail -c 3) (Fall $NEXT_YEAR)"
echo "   - WI$(echo $NEXT_YEAR | tail -c 3) (Winter $NEXT_YEAR)"
echo ""

TERM=""
while true; do
    read -p "Enter term (e.g., FA25): " term_input
    
    # Validate term format
    if [[ $term_input =~ ^(SP|SU|FA|WI)[0-9]{2}$ ]]; then
        TERM="$term_input"
        
        # Extract season and year for display
        SEASON_CODE="${term_input:0:2}"
        YEAR_CODE="${term_input:2:2}"
        FULL_YEAR="20$YEAR_CODE"
        
        case $SEASON_CODE in
            "SP") SEASON_NAME="Spring" ;;
            "SU") SEASON_NAME="Summer" ;;
            "FA") SEASON_NAME="Fall" ;;
            "WI") SEASON_NAME="Winter" ;;
        esac
        
        # Warn about potentially invalid years
        if [ $FULL_YEAR -lt 2020 ] || [ $FULL_YEAR -gt 2030 ]; then
            echo "⚠️  Warning: $SEASON_NAME $FULL_YEAR might be outside the typical range."
            echo "   Cornell course data is typically available for recent years (2020-2030)."
            read -p "Continue anyway? (y/N): " confirm
            if [[ ! $confirm =~ ^[Yy]$ ]]; then
                echo "Please enter a different term."
                continue
            fi
        fi
        
        echo "✅ Selected: $SEASON_NAME $FULL_YEAR ($TERM)"
        break
    else
        echo "❌ Invalid format. Please use format like FA25, SP24, SU24, or WI25"
        echo "   💡 Note: Use 2-digit years (e.g., 25 for 2025, 24 for 2024)"
    fi
done

# Export term for the Python script
export SCRAPER_TERM="$TERM"
echo ""

# Check if environment variables are set and ask for database choice
DATABASE_CHOICE=""
if [ -n "$SCRAPER_PROD_DATABASE_URL" ] && [ -n "$SCRAPER_TEST_DATABASE_URL" ]; then
    echo "📊 Choose database environment:"
    echo "   1) Production Database"
    echo "   2) Test Database"
    echo ""
    
    while true; do
        read -p "Select database (1-2): " choice
        case $choice in
            1)
                export DATABASE_URL="$SCRAPER_PROD_DATABASE_URL"
                DATABASE_CHOICE="Production"
                echo "✅ Selected: Production Database"
                break
                ;;
            2)
                export DATABASE_URL="$SCRAPER_TEST_DATABASE_URL"
                DATABASE_CHOICE="Test"
                echo "✅ Selected: Test Database"
                break
                ;;
            *)
                echo "❌ Please enter 1 or 2"
                ;;
        esac
    done
    echo ""
else
    echo "⚠️  Database environment variables not found."
    echo "   Please set SCRAPER_PROD_DATABASE_URL and SCRAPER_TEST_DATABASE_URL"
    echo "   Continuing with scraping only..."
    echo ""
fi

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "scripts/requirements.txt" ]; then
    echo "❌ scripts/requirements.txt not found. Please run this script from the scraper directory."
    exit 1
fi

# Create virtual environment if it doesn't exist
VENV_CREATED=false
VENV_EXISTED=false
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    VENV_CREATED=true
else
    echo "📦 Using existing virtual environment..."
    VENV_EXISTED=true
fi

# Set up cleanup function
cleanup() {
    echo ""
    
    # Skip cleanup if requested
    if [ "$SKIP_CLEANUP" = true ]; then
        echo "⏭️  Skipping virtual environment cleanup (--skip-cleanup flag used)"
        return
    fi
    
    # Force cleanup if requested
    if [ "$FORCE_CLEANUP" = true ] && [ -d "venv" ]; then
        echo "🧹 Force cleaning virtual environment (--force-cleanup flag used)..."
        rm -rf venv
        echo "✅ Virtual environment removed"
        return
    fi
    
    # Default behavior: clean up only if we created it
    if [ "$VENV_CREATED" = true ] && [ -d "venv" ]; then
        echo "🧹 Cleaning up virtual environment that was created by this script..."
        rm -rf venv
        echo "✅ Virtual environment removed"
    elif [ "$VENV_EXISTED" = true ] && [ -d "venv" ]; then
        echo "🤔 Virtual environment already existed before running this script."
        echo -n "   Would you like to remove it? (y/N): "
        read -r -t 10 cleanup_choice
        if [[ $cleanup_choice =~ ^[Yy]$ ]]; then
            echo "🧹 Removing existing virtual environment..."
            rm -rf venv
            echo "✅ Virtual environment removed"
        else
            echo "📁 Keeping existing virtual environment"
        fi
    fi
}

# Set trap to cleanup on script exit
trap cleanup EXIT

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "📚 Installing Python dependencies..."
pip install --upgrade pip
pip install -r scripts/requirements.txt

echo "🚀 Starting Cornell course scraper for $SEASON_NAME $FULL_YEAR ($TERM)..."

# Run the scraper (no database connection needed)
if python3 scripts/cornell_courses_scraper_v2.py; then
    SCRAPER_SUCCESS=true
else
    SCRAPER_SUCCESS=false
    SCRAPER_EXIT_CODE=$?
fi

# Check if scraping was successful and files contain data
check_files_have_data() {
    # Check if JSON file exists and has content (more than just empty array)
    if [ -f "output/cornell_courses.json" ]; then
        local json_size=$(wc -c < "output/cornell_courses.json" 2>/dev/null || echo "0")
        local json_content=$(head -c 20 "output/cornell_courses.json" 2>/dev/null || echo "")
        
        # Check if file is larger than minimal empty array "[]" and doesn't start with empty array
        if [ "$json_size" -gt 5 ] && [[ ! "$json_content" =~ ^\s*\[\s*\]\s*$ ]]; then
            return 0  # Has data
        fi
    fi
    return 1  # No data or file doesn't exist
}

if [ "$SCRAPER_SUCCESS" = true ] && [ -f "output/cornell_courses.json" ] && [ -f "output/cornell_courses.csv" ] && check_files_have_data; then
    echo ""
    echo "✅ Scraping completed successfully!"
    echo "📁 Files generated in output directory:"
    echo "   - output/cornell_courses.json"
    echo "   - output/cornell_courses.csv"
    echo "   - output/cornell_page.html"
    echo ""
    # Automatically update database if DATABASE_URL is set
    if [ -n "$DATABASE_URL" ]; then
        echo "🔄 Updating $DATABASE_CHOICE database..."
        
        # Capture the output to check for errors
        DB_OUTPUT=$(python3 scripts/update_database.py output/cornell_courses.json 2>&1)
        DB_EXIT_CODE=$?
        
        # Display the output
        echo "$DB_OUTPUT"
        
        # Parse the summary for more accurate reporting
        COURSES_INSERTED=$(echo "$DB_OUTPUT" | grep -o "Courses inserted: [0-9]*" | grep -o "[0-9]*")
        COURSES_UPDATED=$(echo "$DB_OUTPUT" | grep -o "Courses updated: [0-9]*" | grep -o "[0-9]*")
        COURSES_SKIPPED=$(echo "$DB_OUTPUT" | grep -o "Courses skipped: [0-9]*" | grep -o "[0-9]*")
        TOTAL_PROCESSED=$(echo "$DB_OUTPUT" | grep -o "Total processed: [0-9]*" | grep -o "[0-9]*")
        
        # Check for specific error indicators
        if [ $DB_EXIT_CODE -ne 0 ]; then
            echo "❌ Database update failed with exit code $DB_EXIT_CODE"
            exit 1
        elif echo "$DB_OUTPUT" | grep -q "ERROR.*Failed to process course\|cannot execute.*read-only\|transaction is aborted"; then
            echo "❌ Database errors detected during update!"
            echo "💡 This appears to be a database permission issue (read-only transaction)"
            echo "🔍 Check if your database connection has write permissions"
            exit 1
        elif [ "$COURSES_INSERTED" = "0" ] && [ "$COURSES_UPDATED" = "0" ] && [ "$COURSES_SKIPPED" = "$TOTAL_PROCESSED" ]; then
            echo "✅ Database update completed - all courses were already up to date"
            echo "📊 $COURSES_SKIPPED courses skipped (no changes needed)"
        elif [ "$COURSES_INSERTED" -gt 0 ] || [ "$COURSES_UPDATED" -gt 0 ]; then
            echo "✅ $DATABASE_CHOICE database updated successfully for $SEASON_NAME $FULL_YEAR!"
            [ "$COURSES_INSERTED" -gt 0 ] && echo "   📝 $COURSES_INSERTED new courses added"
            [ "$COURSES_UPDATED" -gt 0 ] && echo "   🔄 $COURSES_UPDATED courses updated"
            [ "$COURSES_SKIPPED" -gt 0 ] && echo "   ⏭️  $COURSES_SKIPPED courses skipped (already up to date)"
        else
            echo "⚠️  Database update completed but results are unclear"
            echo "📊 Summary: $COURSES_INSERTED inserted, $COURSES_UPDATED updated, $COURSES_SKIPPED skipped"
        fi
    else
        echo "🔄 To update your database manually, run:"
        echo "   export DATABASE_URL='your_postgresql_connection_string'"
        echo "   python3 scripts/update_database.py output/cornell_courses.json --preview  # Preview changes"
        echo "   python3 scripts/update_database.py output/cornell_courses.json           # Update database"
    fi
else
    echo ""
    echo "❌ Scraping failed!"
    
    if [ "$SCRAPER_SUCCESS" = false ]; then
        echo "🔍 The scraper encountered an error (exit code: ${SCRAPER_EXIT_CODE:-unknown})"
        echo ""
        echo "💡 Common causes:"
        echo "   • Invalid term: '$TERM' may not exist or be available yet"
        echo "   • Network connectivity issues"
        echo "   • Cornell's website may be temporarily unavailable"
        echo "   • The term format may be correct but the courses aren't published yet"
        echo ""
        echo "🛠️  Troubleshooting:"
        echo "   • Verify the term exists on Cornell's course roster"
        echo "   • Try a different term (e.g., FA25, SP24)"
        echo "   • Check your internet connection"
        echo "   • Try again later if it's a temporary issue"
    elif [ "$SCRAPER_SUCCESS" = true ] && ! check_files_have_data; then
        echo "🔍 Scraper completed but no valid course data was found for term '$TERM'"
        echo ""
        echo "💡 This usually means:"
        echo "   • The term '$TERM' exists but has no courses published yet"
        echo "   • The term is too far in the future"
        echo "   • The term may be for a different campus (this scraper targets Cornell NYC)"
        echo ""
        echo "🛠️  Suggestions:"
        echo "   • Try a current or recent term (e.g., FA25, SP24)"
        echo "   • Check Cornell's course roster website to verify courses exist"
        echo "   • Wait for course schedules to be published for future terms"
    else
        echo "🔍 Files were not generated properly. Check the logs above."
    fi
    
    exit 1
fi 