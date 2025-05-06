-- Add taken column to course_planner table
ALTER TABLE course_planner
ADD COLUMN taken BOOLEAN DEFAULT FALSE; 