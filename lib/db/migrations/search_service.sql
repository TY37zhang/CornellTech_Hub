-- Create search cache table
CREATE TABLE IF NOT EXISTS search_cache (
    query TEXT PRIMARY KEY,
    results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster cache lookups
CREATE INDEX IF NOT EXISTS idx_search_cache_created_at ON search_cache(created_at);

-- Create search costs table
CREATE TABLE IF NOT EXISTS search_costs (
    id SERIAL PRIMARY KEY,
    cost DECIMAL(10,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for cost tracking queries
CREATE INDEX IF NOT EXISTS idx_search_costs_created_at ON search_costs(created_at);

-- Create function to clean up old cache entries
CREATE OR REPLACE FUNCTION cleanup_old_search_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM search_cache
    WHERE created_at < NOW() - INTERVAL '30 minutes';
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old cost entries
CREATE OR REPLACE FUNCTION cleanup_old_search_costs()
RETURNS void AS $$
BEGIN
    DELETE FROM search_costs
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql; 