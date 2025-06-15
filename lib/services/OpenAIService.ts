import { OpenAI } from "openai";
import {
    ChatCompletionMessageParam,
    ChatCompletionCreateParamsStreaming,
    ChatCompletionCreateParamsNonStreaming,
    ChatCompletionChunk,
    ChatCompletion,
    ChatCompletionContentPartText,
    ChatCompletionContentPart,
    ChatCompletionContentPartRefusal,
} from "openai/resources/chat/completions";
import { DatabaseService } from "../services/DatabaseService";
import { SearchService } from "../services/SearchService";

// TypeScript interfaces
export interface ChatFunctionDefinition {
    name: string;
    description: string;
    parameters: Record<string, any>;
}

export interface CostLog {
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    timestamp: string;
}

// Add new interfaces for conversation context
interface ConversationContext {
    courseMentions: Set<string>;
    programMentions: Set<string>;
    departmentMentions: Set<string>;
    semesterMentions: Set<string>;
    lastQueryType: "course" | "review" | "schedule" | "requirement" | "general";
    lastQueryTimestamp: string;
}

interface ConversationHistory {
    userId: string;
    messages: ChatCompletionMessageParam[];
    context: ConversationContext;
    lastUpdated: string;
}

// Add new interfaces for search routing
interface SearchContext {
    queryType:
        | "course"
        | "review"
        | "current"
        | "academic"
        | "technical"
        | "general";
    confidence: number;
    secondaryType?:
        | "course"
        | "review"
        | "current"
        | "academic"
        | "technical"
        | "general";
    secondaryConfidence?: number;
    sources: string[];
    timestamp: string;
}

interface SearchResult {
    source: "database" | "web" | "hybrid";
    content: any;
    relevance: number;
    timestamp: string;
}

// Update system prompt with search routing logic
const SYSTEM_PROMPT = `You are a helpful assistant for Cornell Tech students with access to multiple information sources. You can intelligently route queries to the most appropriate source:

1. Course Information (Database Priority):
   - Course details, reviews, schedules
   - Program requirements
   - Course planning
   - Use format "**Course Code: Course Title**" in bold

2. Current Events (Web Search Priority):
   - Recent developments
   - News and updates
   - Latest information
   - Cite sources with timestamps

3. Academic Questions (Hybrid Approach):
   - Combine database and web search
   - Prioritize academic sources
   - Include both historical and current information
   - Cross-reference multiple sources

4. Technical Questions (Web Search Priority):
   - Latest programming information
   - Technical documentation
   - Best practices
   - Cite official documentation

Search Routing Rules:
1. Course/Review Queries:
   - Check database first
   - Fall back to web search if needed
   - Always verify course codes

2. Current Events:
   - Use web search for recent information
   - Verify source credibility
   - Include timestamps

3. Academic Questions:
   - Start with database
   - Supplement with web search
   - Cross-reference sources
   - Prioritize academic sources

4. Technical Questions:
   - Use web search for latest info
   - Include official documentation
   - Cite version numbers
   - Link to resources

Source Attribution:
- Database sources: "According to Cornell Tech records..."
- Web sources: "According to [Source Name] (accessed [Date])..."
- Academic sources: "According to [Author/Institution] (Year)..."
- Technical sources: "According to [Documentation] (Version)..."

Fallback Strategy:
1. If database search fails:
   - Try web search
   - Use cached results if available
   - Inform user of limitations

2. If web search fails:
   - Use database as fallback
   - Check cached results
   - Provide general information

3. If both fail:
   - Use general knowledge
   - Be transparent about limitations
   - Suggest alternative approaches

Remember:
- Always verify information accuracy
- Cross-reference multiple sources
- Be transparent about source limitations
- Provide context for information
- Include relevant timestamps
- Format course information properly

You have access to the following database tables:
- users: User information and profiles
- user_token_usage: Token usage tracking for users
- courses: Course information including code, name, description, credits, department, etc.
- course_special_requirements: Special requirements for courses
- course_schedules: Course scheduling information
- course_reviews: Course reviews and ratings
- course_planner: Course planning and requirements tracking
- course_category_junction: Course category relationships
- course_categories: Course category definitions
- chat_messages: Chat conversation history
- chat_conversations: Chat conversation metadata

You can search and retrieve information from these tables to provide accurate and helpful responses.

Remember: When mentioning any course, ALWAYS use the format "**Course Code: Course Title**" in bold. For example: "**CS 5785: Applied Machine Learning**" or "**INFO 5100: Application Programming and Design**".`;

// Function definitions for database access
export const functionDefinitions: ChatFunctionDefinition[] = [
    {
        name: "get_user_info",
        description: "Get non-sensitive information about a user",
        parameters: {
            type: "object",
            properties: {
                userId: {
                    type: "string",
                    description: "The user ID to get information for",
                },
            },
            required: ["userId"],
        },
    },
    {
        name: "search_courses",
        description: "Search for Cornell Tech courses with advanced filtering",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description:
                        "Search query for courses (code, name, or description)",
                },
                department: {
                    type: "string",
                    description: "Filter by department",
                },
                semester: {
                    type: "string",
                    description: "Filter by semester (e.g., 'Fall', 'Spring')",
                },
                year: {
                    type: "number",
                    description: "Filter by year",
                },
                minCredits: {
                    type: "number",
                    description: "Minimum number of credits",
                },
                maxCredits: {
                    type: "number",
                    description: "Maximum number of credits",
                },
                category: {
                    type: "string",
                    description: "Filter by course category",
                },
            },
            required: ["query"],
        },
    },
    {
        name: "get_course_details",
        description: "Get comprehensive information about a specific course",
        parameters: {
            type: "object",
            properties: {
                courseId: {
                    type: "string",
                    description: "The course ID or code to get details for",
                },
            },
            required: ["courseId"],
        },
    },
    {
        name: "get_course_reviews",
        description:
            "Get reviews for a specific course with filtering and sorting",
        parameters: {
            type: "object",
            properties: {
                courseId: {
                    type: "string",
                    description: "The course ID to get reviews for",
                },
                minRating: {
                    type: "number",
                    description: "Minimum rating to include (0-5)",
                },
                maxRating: {
                    type: "number",
                    description: "Maximum rating to include (0-5)",
                },
                minDifficulty: {
                    type: "number",
                    description: "Minimum difficulty rating (0-5)",
                },
                maxDifficulty: {
                    type: "number",
                    description: "Maximum difficulty rating (0-5)",
                },
                minWorkload: {
                    type: "number",
                    description: "Minimum workload rating (0-5)",
                },
                maxWorkload: {
                    type: "number",
                    description: "Maximum workload rating (0-5)",
                },
                sortBy: {
                    type: "string",
                    description:
                        "Sort by field (rating, difficulty, workload, date)",
                    enum: ["rating", "difficulty", "workload", "date"],
                },
                sortOrder: {
                    type: "string",
                    description: "Sort order (asc or desc)",
                    enum: ["asc", "desc"],
                },
                limit: {
                    type: "number",
                    description: "Maximum number of reviews to return",
                },
            },
            required: ["courseId"],
        },
    },
    {
        name: "get_course_schedule",
        description: "Get schedule and availability information for a course",
        parameters: {
            type: "object",
            properties: {
                courseId: {
                    type: "string",
                    description: "The course ID to get schedule for",
                },
                semester: {
                    type: "string",
                    description:
                        "The semester to get schedule for (e.g., 'Fall', 'Spring')",
                },
                year: {
                    type: "number",
                    description: "The year to get schedule for",
                },
            },
            required: ["courseId"],
        },
    },
    {
        name: "get_course_requirements",
        description: "Get prerequisites and corequisites for a course",
        parameters: {
            type: "object",
            properties: {
                courseId: {
                    type: "string",
                    description: "The course ID to get requirements for",
                },
            },
            required: ["courseId"],
        },
    },
    {
        name: "get_course_categories",
        description: "Get all course categories",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },
    {
        name: "web_search",
        description: "Search the web for up-to-date information",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Search query for the web",
                },
            },
            required: ["query"],
        },
    },
    {
        name: "search_courses_database",
        description: "Search Cornell Tech courses in the database",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Search query for courses",
                },
                filters: {
                    type: "object",
                    properties: {
                        department: { type: "string" },
                        semester: { type: "string" },
                        year: { type: "number" },
                        minCredits: { type: "number" },
                        maxCredits: { type: "number" },
                        category: { type: "string" },
                    },
                },
            },
            required: ["query"],
        },
    },
    {
        name: "search_web",
        description: "Search the web for current information",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Search query",
                },
                maxResults: {
                    type: "number",
                    description: "Maximum number of results",
                },
                minRelevance: {
                    type: "number",
                    description: "Minimum relevance score (0-1)",
                },
                sourceTypes: {
                    type: "array",
                    items: {
                        type: "string",
                        enum: ["academic", "news", "technical", "general"],
                    },
                },
            },
            required: ["query"],
        },
    },
    {
        name: "hybrid_search",
        description: "Combine database and web search results",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Search query",
                },
                databaseFilters: {
                    type: "object",
                    properties: {
                        department: { type: "string" },
                        category: { type: "string" },
                    },
                },
                webFilters: {
                    type: "object",
                    properties: {
                        maxResults: { type: "number" },
                        minRelevance: { type: "number" },
                        sourceTypes: {
                            type: "array",
                            items: {
                                type: "string",
                                enum: [
                                    "academic",
                                    "news",
                                    "technical",
                                    "general",
                                ],
                            },
                        },
                    },
                },
            },
            required: ["query"],
        },
    },
];

// Model cost per 1K tokens (example values, update as needed)
const MODEL_COSTS: Record<string, number> = {
    "gpt-3.5-turbo": 0.002,
    "gpt-3.5-turbo-0125": 0.002,
    "gpt-3.5-turbo-1106": 0.002,
    "gpt-4.1-mini": 0.002, // $0.40/1M tokens = $0.002/1K tokens
};

// OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
});

// Helper function for exponential backoff
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class OpenAIService {
    static getSystemPrompt(): ChatCompletionMessageParam {
        return {
            role: "system",
            content: `You are an intelligent and helpful assistant for Cornell Tech students. Your primary goal is to provide accurate, relevant, and helpful information about courses and academic matters. You should:

1. Think step by step:
   - First, understand the user's question or request
   - Then, determine what information you need to provide a complete answer
   - Finally, use the appropriate functions to gather that information

2. Be proactive and thorough:
   - Don't just answer the immediate question, but anticipate follow-up questions
   - Provide context and explanations when needed
   - Suggest related information that might be helpful

3. Use your functions intelligently:
   - When searching for courses, use relevant filters to narrow down results
   - When getting course details, also fetch reviews and requirements
   - When appropriate, combine information from multiple functions

4. For course recommendations:
   - Consider the user's program and background
   - Look at course reviews and ratings
   - Check prerequisites and requirements
   - Consider course schedules and availability
   - Suggest complementary courses

5. For product management related queries:
   - Focus on courses that develop product management skills
   - Consider both technical and business aspects
   - Look for practical, hands-on components
   - Pay attention to user-centered design and market analysis

6. Always be helpful and friendly:
   - Provide clear, well-structured responses
   - Use examples and specific details
   - Be honest about limitations
   - Suggest alternatives when appropriate

You have access to the following functions:
1. search_courses: Search for courses with advanced filtering
2. get_course_details: Get comprehensive course information
3. get_course_reviews: Get course reviews with filtering
4. get_course_schedule: Get schedule information
5. get_course_requirements: Get prerequisites and requirements
6. get_course_categories: Get all course categories
7. get_user_info: Get non-sensitive user information
8. web_search: Search the web for up-to-date information

Use these functions thoughtfully to provide the most helpful responses possible.`,
        };
    }

    static async countTokens(
        messages: ChatCompletionMessageParam[],
        model: string
    ): Promise<number> {
        // Use OpenAI API or tiktoken for accurate counting (placeholder: count words)
        return messages.reduce((acc, msg) => {
            if (typeof msg.content === "string") {
                return acc + msg.content.split(" ").length;
            }
            return acc;
        }, 0);
    }

    static async chat(
        userMessages: ChatCompletionMessageParam[],
        model: string = "gpt-4.1-mini",
        stream = false,
        userId?: string,
        program?: string | null
    ): Promise<{
        response: ChatCompletion | AsyncGenerator<ChatCompletionChunk>;
        costLog: CostLog;
    }> {
        // Process chat history to maintain context
        const processedMessages = this.processChatHistory(userMessages, userId);

        // Determine query type from the last user message
        const lastUserMessage = userMessages[userMessages.length - 1];
        let searchContext: SearchContext | null = null;
        if (
            lastUserMessage &&
            lastUserMessage.role === "user" &&
            typeof lastUserMessage.content === "string"
        ) {
            searchContext = this.determineQueryType(lastUserMessage.content);
        }

        // Add search context to system prompt if available
        let systemPrompt = program
            ? `You are an intelligent and helpful assistant for Cornell Tech students. The user is in the ${program} program. Your primary goal is to provide accurate, relevant, and helpful information about courses and academic matters.`
            : this.getSystemPrompt();

        if (searchContext) {
            let contextPrompt = `\n\nBased on the user's query, I've determined this is a ${searchContext.queryType} type question with ${Math.round(searchContext.confidence * 100)}% confidence.`;

            if (searchContext.secondaryType) {
                contextPrompt += ` There's also a secondary ${searchContext.secondaryType} aspect with ${Math.round(searchContext.secondaryConfidence! * 100)}% confidence.`;
            }

            contextPrompt += `\nThe following sources will be prioritized: ${searchContext.sources.join(", ")}.`;

            // Add specific guidance based on query type
            if (searchContext.queryType === "course") {
                contextPrompt += `\nFor course-related queries, prioritize database information and include course codes in bold format (e.g., **CS 5785: Applied Machine Learning**).`;
            } else if (searchContext.queryType === "current") {
                contextPrompt += `\nFor current events, focus on recent information and include timestamps for all sources.`;
            } else if (searchContext.queryType === "academic") {
                contextPrompt += `\nFor academic queries, combine database information with scholarly sources and include proper citations.`;
            } else if (searchContext.queryType === "technical") {
                contextPrompt += `\nFor technical queries, prioritize official documentation and include version numbers when relevant.`;
            }

            systemPrompt += contextPrompt;
        }

        const messages: ChatCompletionMessageParam[] = [
            typeof systemPrompt === "string"
                ? { role: "system", content: systemPrompt }
                : systemPrompt,
            ...processedMessages,
        ];

        const functions = functionDefinitions;
        const modelCost = MODEL_COSTS[model] || 0.01;
        const timestamp = new Date().toISOString();

        const maxRetries = 3;
        let retryCount = 0;
        let lastError: any;

        while (retryCount < maxRetries) {
            try {
                if (stream) {
                    const req: ChatCompletionCreateParamsStreaming = {
                        messages,
                        model,
                        stream: true,
                        user: userId,
                    };
                    const streamRes = await openai.chat.completions.create(req);
                    const estimatedTokens = await this.countTokens(
                        messages,
                        model
                    );
                    return {
                        response: (async function* () {
                            for await (const chunk of streamRes) {
                                yield chunk as ChatCompletionChunk;
                            }
                        })(),
                        costLog: {
                            model,
                            promptTokens: estimatedTokens,
                            completionTokens: Math.floor(estimatedTokens * 0.5),
                            totalTokens: Math.floor(estimatedTokens * 1.5),
                            cost: ((estimatedTokens * 1.5) / 1000) * modelCost,
                            timestamp,
                        },
                    };
                } else {
                    const req: ChatCompletionCreateParamsNonStreaming = {
                        messages,
                        model,
                        functions,
                        function_call: "auto",
                        user: userId,
                    };
                    const res = await openai.chat.completions.create(req);

                    // Handle function calls
                    const message = res.choices[0]?.message;
                    if (message?.function_call) {
                        const functionName = message.function_call.name;
                        const functionArgs = JSON.parse(
                            message.function_call.arguments || "{}"
                        );

                        let functionResult;
                        try {
                            // If we have search context, use it to influence function selection
                            if (searchContext) {
                                if (
                                    searchContext.queryType === "course" &&
                                    functionName === "search_courses"
                                ) {
                                    // Prioritize database search for course queries
                                    functionResult =
                                        await this.searchCoursesDatabase(
                                            functionArgs.query,
                                            functionArgs
                                        );
                                } else if (
                                    searchContext.queryType === "current" &&
                                    functionName === "web_search"
                                ) {
                                    // Prioritize web search for current events
                                    functionResult = await this.searchWeb(
                                        functionArgs.query,
                                        {
                                            maxResults: 5,
                                            minRelevance: 0.7,
                                            sourceTypes: ["news", "current"],
                                        }
                                    );
                                } else if (
                                    searchContext.queryType === "academic" &&
                                    functionName === "hybrid_search"
                                ) {
                                    // Use hybrid search for academic queries
                                    functionResult = await this.hybridSearch(
                                        functionArgs.query,
                                        {
                                            databaseFilters: {
                                                department:
                                                    functionArgs.department,
                                                category: functionArgs.category,
                                            },
                                            webFilters: {
                                                maxResults: 3,
                                                minRelevance: 0.8,
                                                sourceTypes: [
                                                    "academic",
                                                    "research",
                                                ],
                                            },
                                        }
                                    );
                                } else if (
                                    searchContext.queryType === "technical" &&
                                    functionName === "web_search"
                                ) {
                                    // Prioritize technical documentation for technical queries
                                    functionResult = await this.searchWeb(
                                        functionArgs.query,
                                        {
                                            maxResults: 3,
                                            minRelevance: 0.8,
                                            sourceTypes: [
                                                "technical",
                                                "documentation",
                                            ],
                                        }
                                    );
                                } else {
                                    // Fall back to original function handling
                                    functionResult =
                                        await this.handleFunctionCall(
                                            message.function_call
                                        );
                                }
                            } else {
                                // No search context, use original function handling
                                functionResult = await this.handleFunctionCall(
                                    message.function_call
                                );
                            }

                            // Add function result to messages and get a new response
                            messages.push({
                                role: "assistant",
                                content: null,
                                function_call: message.function_call,
                            });
                            messages.push({
                                role: "function",
                                name: functionName,
                                content: functionResult || "{}",
                            });

                            // Get a new response with the function result
                            const secondResponse =
                                await openai.chat.completions.create({
                                    messages,
                                    model,
                                    functions,
                                    user: userId,
                                });

                            // Get exact token counts from the API response
                            const promptTokens =
                                secondResponse.usage?.prompt_tokens || 0;
                            const completionTokens =
                                secondResponse.usage?.completion_tokens || 0;
                            const totalTokens =
                                secondResponse.usage?.total_tokens || 0;
                            const cost = (totalTokens / 1000) * modelCost;

                            return {
                                response: secondResponse,
                                costLog: {
                                    model,
                                    promptTokens,
                                    completionTokens,
                                    totalTokens,
                                    cost,
                                    timestamp,
                                },
                            };
                        } catch (error: any) {
                            console.error(
                                `Error executing function ${functionName}:`,
                                error
                            );
                            functionResult = JSON.stringify({
                                error: `Error executing ${functionName}: ${error.message}`,
                            });
                        }
                    }

                    // Get exact token counts from the API response
                    const promptTokens = res.usage?.prompt_tokens || 0;
                    const completionTokens = res.usage?.completion_tokens || 0;
                    const totalTokens = res.usage?.total_tokens || 0;
                    const cost = (totalTokens / 1000) * modelCost;

                    return {
                        response: res,
                        costLog: {
                            model,
                            promptTokens,
                            completionTokens,
                            totalTokens,
                            cost,
                            timestamp,
                        },
                    };
                }
            } catch (error: any) {
                lastError = error;
                if (error?.status === 429) {
                    // Check if it's a quota exceeded error
                    if (error.code === "insufficient_quota") {
                        throw new Error(
                            "OpenAI quota exceeded. Please check your billing details and plan limits."
                        );
                    }

                    retryCount++;
                    if (retryCount < maxRetries) {
                        // Exponential backoff: 2^retryCount * 1000ms
                        const backoffTime = Math.pow(2, retryCount) * 1000;
                        console.log(
                            `Rate limit hit, retrying in ${backoffTime}ms...`
                        );
                        await sleep(backoffTime);
                        continue;
                    }
                }
                throw error;
            }
        }

        // If we've exhausted all retries, throw the last error
        if (lastError?.status === 429) {
            if (lastError.code === "insufficient_quota") {
                throw new Error(
                    "OpenAI quota exceeded. Please check your billing details and plan limits."
                );
            }
            throw new Error(
                "OpenAI rate limit exceeded. Please try again in a few minutes."
            );
        }
        if (lastError?.response?.data) {
            throw new Error(
                `OpenAI API error: ${JSON.stringify(lastError.response.data)}`
            );
        }
        throw new Error("OpenAI API error: " + lastError.message);
    }

    private static processChatHistory(
        messages: ChatCompletionMessageParam[],
        userId?: string
    ): ChatCompletionMessageParam[] {
        // Initialize context
        const context: ConversationContext = {
            courseMentions: new Set<string>(),
            programMentions: new Set<string>(),
            departmentMentions: new Set<string>(),
            semesterMentions: new Set<string>(),
            lastQueryType: "general",
            lastQueryTimestamp: new Date().toISOString(),
        };

        // Process each message to build context
        messages.forEach((msg) => {
            if (msg.role === "user" && typeof msg.content === "string") {
                const content = msg.content.toLowerCase();

                // Extract course codes
                const courseCodeMatches = msg.content.match(
                    /\b[A-Z]{2,4}\s*\d{4}\b/g
                );
                if (courseCodeMatches) {
                    courseCodeMatches.forEach((code) =>
                        context.courseMentions.add(code.replace(/\s+/g, ""))
                    );
                }

                // Extract program mentions
                const programMatches = content.match(
                    /\b(ms|meng|phd|mba|mps)\b/g
                );
                if (programMatches) {
                    programMatches.forEach((program) =>
                        context.programMentions.add(program.toUpperCase())
                    );
                }

                // Extract department mentions
                const departmentMatches = content.match(
                    /\b(cs|info|ece|tech|business)\b/g
                );
                if (departmentMatches) {
                    departmentMatches.forEach((dept) =>
                        context.departmentMentions.add(dept.toUpperCase())
                    );
                }

                // Extract semester mentions
                const semesterMatches = content.match(
                    /\b(fall|spring|summer|winter)\b/g
                );
                if (semesterMatches) {
                    semesterMatches.forEach((semester) =>
                        context.semesterMentions.add(semester)
                    );
                }

                // Determine query type
                if (content.includes("review")) {
                    context.lastQueryType = "review";
                } else if (
                    content.includes("schedule") ||
                    content.includes("when") ||
                    content.includes("time")
                ) {
                    context.lastQueryType = "schedule";
                } else if (
                    content.includes("prerequisite") ||
                    content.includes("requirement")
                ) {
                    context.lastQueryType = "requirement";
                } else if (courseCodeMatches) {
                    context.lastQueryType = "course";
                }
            }
        });

        // Add context-aware system message based on the last query type
        const lastMessage = messages[messages.length - 1];
        if (
            lastMessage &&
            lastMessage.role === "user" &&
            typeof lastMessage.content === "string"
        ) {
            let contextMessage = "";

            switch (context.lastQueryType) {
                case "review":
                    if (context.courseMentions.size > 0) {
                        contextMessage = `The user is asking about reviews for the following courses: ${Array.from(context.courseMentions).join(", ")}. Please fetch and provide reviews for these courses.`;
                    }
                    break;
                case "schedule":
                    if (context.courseMentions.size > 0) {
                        const semesterContext =
                            context.semesterMentions.size > 0
                                ? ` for ${Array.from(context.semesterMentions).join(" or ")}`
                                : "";
                        contextMessage = `The user is asking about schedules for the following courses: ${Array.from(context.courseMentions).join(", ")}${semesterContext}. Please provide schedule information.`;
                    }
                    break;
                case "requirement":
                    if (context.courseMentions.size > 0) {
                        contextMessage = `The user is asking about requirements for the following courses: ${Array.from(context.courseMentions).join(", ")}. Please provide prerequisite and corequisite information.`;
                    }
                    break;
                case "course":
                    if (context.programMentions.size > 0) {
                        contextMessage = `The user is in the ${Array.from(context.programMentions).join(" or ")} program and is asking about courses. Please consider program-specific requirements and recommendations.`;
                    }
                    break;
            }

            if (contextMessage) {
                messages = [
                    ...messages.slice(0, -1),
                    {
                        role: "system",
                        content: contextMessage,
                    },
                    lastMessage,
                ];
            }
        }

        // If we have a userId, store the conversation history
        if (userId) {
            this.storeConversationHistory({
                userId,
                messages,
                context,
                lastUpdated: new Date().toISOString(),
            });
        }

        return messages;
    }

    // Add method to store conversation history
    private static async storeConversationHistory(
        history: ConversationHistory
    ): Promise<void> {
        try {
            // Convert Sets to Arrays for database storage
            const dbHistory = {
                ...history,
                context: {
                    ...history.context,
                    courseMentions: Array.from(history.context.courseMentions),
                    programMentions: Array.from(
                        history.context.programMentions
                    ),
                    departmentMentions: Array.from(
                        history.context.departmentMentions
                    ),
                    semesterMentions: Array.from(
                        history.context.semesterMentions
                    ),
                },
            };
            await DatabaseService.storeConversationHistory(dbHistory);
        } catch (error) {
            console.error("Error storing conversation history:", error);
        }
    }

    // Add method to retrieve conversation history
    private static async getConversationHistory(
        userId: string
    ): Promise<ConversationHistory | null> {
        try {
            const dbHistory =
                await DatabaseService.getConversationHistory(userId);
            if (!dbHistory) return null;

            // Convert Arrays to Sets for in-memory use
            return {
                ...dbHistory,
                context: {
                    ...dbHistory.context,
                    courseMentions: new Set(dbHistory.context.courseMentions),
                    programMentions: new Set(dbHistory.context.programMentions),
                    departmentMentions: new Set(
                        dbHistory.context.departmentMentions
                    ),
                    semesterMentions: new Set(
                        dbHistory.context.semesterMentions
                    ),
                },
            };
        } catch (error) {
            console.error("Error retrieving conversation history:", error);
            return null;
        }
    }

    // Update the search functions to return string
    static async searchCoursesDatabase(
        query: string,
        filters?: any
    ): Promise<string> {
        try {
            const results = await DatabaseService.searchCourses(query, filters);
            return this.formatCourseResponse(results);
        } catch (error) {
            console.error("Database search error:", error);
            throw error;
        }
    }

    static async searchWeb(
        query: string,
        options?: {
            maxResults?: number;
            minRelevance?: number;
            sourceTypes?: string[];
        }
    ): Promise<string> {
        try {
            const searchService = new SearchService();
            const results = await searchService.search(query, {
                maxResults: options?.maxResults || 5,
                minRelevance: options?.minRelevance || 0.7,
            });

            // Filter results based on sourceTypes if provided
            const filteredResults = options?.sourceTypes
                ? results.results.filter((result) =>
                      options.sourceTypes?.some((type) =>
                          result.source
                              .toLowerCase()
                              .includes(type.toLowerCase())
                      )
                  )
                : results.results;

            return this.formatWebResponse(filteredResults);
        } catch (error) {
            console.error("Web search error:", error);
            throw error;
        }
    }

    static async hybridSearch(
        query: string,
        options?: {
            databaseFilters?: any;
            webFilters?: any;
        }
    ): Promise<string> {
        try {
            const [dbResults, webResults] = await Promise.all([
                this.searchCoursesDatabase(query, options?.databaseFilters),
                this.searchWeb(query, options?.webFilters),
            ]);

            return this.formatHybridResponse([
                {
                    source: "database",
                    content: dbResults,
                    relevance: 1.0,
                    timestamp: new Date().toISOString(),
                },
                {
                    source: "web",
                    content: webResults,
                    relevance: 0.9,
                    timestamp: new Date().toISOString(),
                },
            ]);
        } catch (error) {
            console.error("Hybrid search error:", error);
            throw error;
        }
    }

    // Add function to determine query type
    static determineQueryType(query: string): SearchContext {
        const coursePatterns = [
            /course|class|lecture|seminar|workshop/i,
            /CS|INFO|ORIE|ECE|MENG|MBA|LLM|JD|MILR|MPS|MHA|MPH|MS|PhD/i,
            /credit|enroll|register|schedule/i,
            /prerequisite|corequisite|requirement/i,
            /professor|instructor|faculty/i,
            /syllabus|curriculum|program/i,
        ];

        const currentEventPatterns = [
            /latest|recent|new|update|announcement|news/i,
            /today|yesterday|this week|this month/i,
            /current|ongoing|happening/i,
            /deadline|due date|application|registration/i,
            /event|workshop|seminar|conference/i,
        ];

        const academicPatterns = [
            /research|study|paper|publication|journal|conference/i,
            /academic|scholarly|theoretical|methodology/i,
            /professor|faculty|researcher/i,
            /thesis|dissertation|project/i,
            /degree|program|curriculum/i,
        ];

        const technicalPatterns = [
            /programming|code|software|development|engineering/i,
            /technology|technical|implementation|architecture/i,
            /framework|library|API|SDK|tool/i,
            /debug|error|bug|issue/i,
            /deploy|host|server|cloud/i,
        ];

        // Calculate confidence scores for each type
        const scores = {
            course: 0,
            current: 0,
            academic: 0,
            technical: 0,
        };

        // Weight patterns by importance
        const weights = {
            primary: 1.0,
            secondary: 0.7,
            tertiary: 0.4,
        };

        // Analyze query for each type
        coursePatterns.forEach((pattern, index) => {
            if (pattern.test(query)) {
                scores.course +=
                    index < 3
                        ? weights.primary
                        : index < 5
                          ? weights.secondary
                          : weights.tertiary;
            }
        });

        currentEventPatterns.forEach((pattern, index) => {
            if (pattern.test(query)) {
                scores.current +=
                    index < 3
                        ? weights.primary
                        : index < 4
                          ? weights.secondary
                          : weights.tertiary;
            }
        });

        academicPatterns.forEach((pattern, index) => {
            if (pattern.test(query)) {
                scores.academic +=
                    index < 3
                        ? weights.primary
                        : index < 4
                          ? weights.secondary
                          : weights.tertiary;
            }
        });

        technicalPatterns.forEach((pattern, index) => {
            if (pattern.test(query)) {
                scores.technical +=
                    index < 3
                        ? weights.primary
                        : index < 4
                          ? weights.secondary
                          : weights.tertiary;
            }
        });

        // Normalize scores
        const maxScore = Math.max(...Object.values(scores));
        const normalizedScores = Object.entries(scores).reduce(
            (acc, [key, value]) => {
                acc[key] = value / maxScore;
                return acc;
            },
            {} as Record<string, number>
        );

        // Determine primary and secondary query types
        const sortedTypes = Object.entries(normalizedScores)
            .sort(([, a], [, b]) => b - a)
            .map(([type]) => type);

        const primaryType = sortedTypes[0] as SearchContext["queryType"];
        const secondaryType = sortedTypes[1] as SearchContext["queryType"];

        // Determine sources based on query types and confidence
        const sources = new Set<string>();
        if (normalizedScores[primaryType] > 0.6) {
            if (primaryType === "course") {
                sources.add("database");
            } else if (primaryType === "current") {
                sources.add("web");
            } else if (primaryType === "academic") {
                sources.add("database");
                sources.add("web");
            } else if (primaryType === "technical") {
                sources.add("web");
            }
        }

        // Add secondary source if confidence is high enough
        if (normalizedScores[secondaryType] > 0.4) {
            if (secondaryType === "course" && !sources.has("database")) {
                sources.add("database");
            } else if (secondaryType === "current" && !sources.has("web")) {
                sources.add("web");
            }
        }

        return {
            queryType: primaryType,
            confidence: normalizedScores[primaryType],
            secondaryType:
                normalizedScores[secondaryType] > 0.4
                    ? secondaryType
                    : undefined,
            secondaryConfidence:
                normalizedScores[secondaryType] > 0.4
                    ? normalizedScores[secondaryType]
                    : undefined,
            sources: Array.from(sources),
            timestamp: new Date().toISOString(),
        };
    }

    // Update the handleFunctionCall method to handle the new return types
    static async handleFunctionCall(functionCall: any): Promise<string> {
        const { name, arguments: args } = functionCall;
        const parsedArgs = JSON.parse(args);

        switch (name) {
            // ... existing cases ...
            case "search_courses_database":
                return await this.searchCoursesDatabase(
                    parsedArgs.query,
                    parsedArgs.filters
                );
            case "search_web":
                return await this.searchWeb(parsedArgs.query, {
                    maxResults: parsedArgs.maxResults,
                    minRelevance: parsedArgs.minRelevance,
                    sourceTypes: parsedArgs.sourceTypes,
                });
            case "hybrid_search":
                return await this.hybridSearch(parsedArgs.query, {
                    databaseFilters: parsedArgs.databaseFilters,
                    webFilters: parsedArgs.webFilters,
                });
            default:
                throw new Error(`Unknown function: ${name}`);
        }
    }

    // Add response formatting functions
    static formatCourseResponse(results: any[]): string {
        if (!results.length) {
            return "I couldn't find any courses matching your query.";
        }

        return results
            .map((course) => {
                const code = course.code || "";
                const title = course.title || course.name || "No Title";
                return (
                    `**${code}: ${title}**\n` +
                    `${course.description ? course.description + "\n" : ""}` +
                    `Credits: ${course.credits}\n` +
                    `Department: ${course.department}\n`
                );
            })
            .join("\n");
    }

    static formatWebResponse(results: any[]): string {
        if (!results.length) {
            return "I couldn't find any recent information matching your query.";
        }

        return results
            .map(
                (result) =>
                    `According to ${result.source} (accessed ${new Date().toLocaleDateString()}):\n` +
                    `${result.snippet}\n` +
                    `Source: ${result.link}\n`
            )
            .join("\n");
    }

    static formatHybridResponse(results: SearchResult[]): string {
        const [dbResults, webResults] = results;
        let response = "";

        if (dbResults.content.length) {
            response +=
                "From Cornell Tech records:\n" +
                this.formatCourseResponse(dbResults.content) +
                "\n\n";
        }

        if (webResults.content.length) {
            response +=
                "Additional information from the web:\n" +
                this.formatWebResponse(webResults.content);
        }

        return (
            response ||
            "I couldn't find any relevant information from either source."
        );
    }

    static formatTechnicalResponse(results: any[]): string {
        if (!results.length) {
            return "I couldn't find any technical documentation matching your query.";
        }

        return results
            .map(
                (result) =>
                    `According to ${result.source} (${result.version || "latest"}):\n` +
                    `${result.snippet}\n` +
                    `Documentation: ${result.link}\n`
            )
            .join("\n");
    }
}
