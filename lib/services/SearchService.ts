import { RateLimiter } from "limiter";
import { sql } from "../db";

// Types
export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    source: string;
    relevance: number;
    timestamp: number;
}

export interface SearchResponse {
    results: SearchResult[];
    totalCost: number;
    cached: boolean;
}

export interface SearchOptions {
    maxResults?: number;
    minRelevance?: number;
    useCache?: boolean;
}

// Constants
const CACHE_TTL = 30 * 60; // 30 minutes in seconds
const MAX_REQUESTS_PER_MINUTE = 60;
const DEFAULT_MIN_RELEVANCE = 0.5;
const DEFAULT_MAX_RESULTS = 5;

// Create a singleton rate limiter
const rateLimiter = new RateLimiter({
    tokensPerInterval: MAX_REQUESTS_PER_MINUTE,
    interval: "minute",
    fireImmediately: true,
});

export class SearchService {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.SERPER_API_KEY!;
    }

    private async checkRateLimit(): Promise<void> {
        try {
            const hasToken = await rateLimiter.tryRemoveTokens(1);
            if (!hasToken) {
                throw new Error("Rate limit exceeded. Please try again later.");
            }
        } catch (error) {
            console.error("Rate limit check failed:", error);
            // If rate limiter fails, we'll still allow the request
            // but log the error for monitoring
        }
    }

    private async getCachedResults(
        query: string
    ): Promise<SearchResult[] | null> {
        try {
            const result = await sql`
                SELECT results, created_at 
                FROM search_cache 
                WHERE query = ${query} 
                AND created_at > NOW() - INTERVAL '30 minutes'
                ORDER BY created_at DESC 
                LIMIT 1
            `;

            if (result.length === 0) return null;
            return result[0].results;
        } catch (error) {
            console.error("Error fetching cached results:", error);
            return null;
        }
    }

    private async setCachedResults(
        query: string,
        results: SearchResult[]
    ): Promise<void> {
        try {
            await sql`
                INSERT INTO search_cache (query, results, created_at)
                VALUES (${query}, ${JSON.stringify(results)}, NOW())
                ON CONFLICT (query) 
                DO UPDATE SET 
                  results = ${JSON.stringify(results)},
                  created_at = NOW()
            `;
        } catch (error) {
            console.error("Error caching results:", error);
        }
    }

    private async trackSearchCost(cost: number): Promise<void> {
        try {
            await sql`
                INSERT INTO search_costs (cost, created_at)
                VALUES (${cost}, NOW())
            `;
        } catch (error) {
            console.error("Error tracking search cost:", error);
        }
    }

    private async getTotalCost(): Promise<number> {
        try {
            const result = await sql`
                SELECT COALESCE(SUM(cost), 0) as total_cost
                FROM search_costs
                WHERE created_at > NOW() - INTERVAL '24 hours'
            `;
            return result[0].total_cost;
        } catch (error) {
            console.error("Error getting total cost:", error);
            return 0;
        }
    }

    private formatQuery(query: string): string {
        return query
            .trim()
            .replace(/[^\w\s]/g, "")
            .replace(/\s+/g, " ");
    }

    private calculateRelevance(result: any): number {
        let score = 0;

        // Title relevance
        if (result.title) score += 0.3;

        // Snippet quality
        if (result.snippet && result.snippet.length > 50) score += 0.3;

        // Source reliability
        const reliableDomains = [".edu", ".gov", ".org"];
        if (reliableDomains.some((domain) => result.link?.includes(domain))) {
            score += 0.4;
        }

        return score;
    }

    private filterResults(
        results: SearchResult[],
        options: SearchOptions
    ): SearchResult[] {
        return results
            .filter(
                (result) =>
                    result.relevance >=
                    (options.minRelevance || DEFAULT_MIN_RELEVANCE)
            )
            .slice(0, options.maxResults || DEFAULT_MAX_RESULTS);
    }

    public async search(
        query: string,
        options: SearchOptions = {}
    ): Promise<SearchResponse> {
        try {
            // Check rate limit
            await this.checkRateLimit();

            // Check cache if enabled
            if (options.useCache !== false) {
                const cachedResults = await this.getCachedResults(query);
                if (cachedResults) {
                    return {
                        results: this.filterResults(cachedResults, options),
                        totalCost: await this.getTotalCost(),
                        cached: true,
                    };
                }
            }

            // Format query
            const formattedQuery = this.formatQuery(query);

            // Make API request
            const response = await fetch("https://google.serper.dev/search", {
                method: "POST",
                headers: {
                    "X-API-KEY": this.apiKey,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    q: formattedQuery,
                    num: options.maxResults || DEFAULT_MAX_RESULTS,
                }),
            });

            if (!response.ok) {
                throw new Error(`Search API error: ${response.statusText}`);
            }

            const data = await response.json();

            // Process and structure results
            const processedResults: SearchResult[] = data.organic.map(
                (result: any) => ({
                    title: result.title,
                    link: result.link,
                    snippet: result.snippet,
                    source: new URL(result.link).hostname,
                    relevance: this.calculateRelevance(result),
                    timestamp: Date.now(),
                })
            );

            // Filter results
            const filteredResults = this.filterResults(
                processedResults,
                options
            );

            // Cache results
            if (options.useCache !== false) {
                await this.setCachedResults(query, filteredResults);
            }

            // Track cost
            const cost = 0.01; // Example cost per request
            await this.trackSearchCost(cost);

            return {
                results: filteredResults,
                totalCost: await this.getTotalCost(),
                cached: false,
            };
        } catch (error) {
            console.error("Search error:", error);
            throw error;
        }
    }

    public async resetCostTracking(): Promise<void> {
        try {
            await sql`
                DELETE FROM search_costs
                WHERE created_at <= NOW()
            `;
        } catch (error) {
            console.error("Error resetting cost tracking:", error);
            throw error;
        }
    }
}
