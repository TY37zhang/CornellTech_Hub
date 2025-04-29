-- Create course_planner table
CREATE TABLE IF NOT EXISTS course_planner (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    requirement_type VARCHAR(32), -- matches the concentration_core/concentration_elective size
    semester VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'in_progress')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_course_semester UNIQUE(user_id, course_id, semester, year)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS course_planner_user_id_idx ON course_planner(user_id);
CREATE INDEX IF NOT EXISTS course_planner_course_id_idx ON course_planner(course_id);
CREATE INDEX IF NOT EXISTS course_planner_requirement_type_idx ON course_planner(requirement_type);
CREATE INDEX IF NOT EXISTS course_planner_semester_year_idx ON course_planner(semester, year);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_course_planner_updated_at
    BEFORE UPDATE ON course_planner
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 