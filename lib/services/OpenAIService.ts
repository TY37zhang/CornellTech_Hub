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
import { DatabaseService, CourseReview } from "./DatabaseService";
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

interface CourseOffering {
    semester: string;
    year: number;
    professor: string;
}

interface CourseWithReviews {
    id: string;
    code: string;
    name: string;
    description: string | null;
    credits: number;
    department: string;
    professor_id: string;
    reviews: CourseReview[];
    reviewCount: number;
    avgRating: number;
    avgDifficulty: number;
    avgWorkload: number;
    codes: Set<string>;
    departments: Set<string>;
}

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
                        enum: ["news", "academic", "technical", "general"],
                    },
                    description: "Types of sources to include",
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

// Update system prompt to reflect tools API
const SYSTEM_PROMPT = `You are a helpful assistant for Cornell Tech students with access to multiple information sources. You can use tools to search and retrieve information:

1. Course Information (Database Priority):
   - Use search_courses to find courses
   - Use get_course_details for specific course information
   - Use get_course_reviews for course reviews
   - Use get_course_schedule for scheduling information
   - Use get_course_requirements for prerequisites
   - Use get_course_categories for course categories

2. Web Search:
   - Use web_search for current information
   - Use hybrid_search to combine database and web results

When using tools:
1. For course queries:
   - Start with search_courses
   - Use get_course_details for specific courses
   - Add get_course_reviews for student feedback
   - Check get_course_schedule for availability

2. For current information:
   - Use web_search with appropriate source types
   - Include maxResults and minRelevance parameters
   - Specify sourceTypes when relevant

3. For academic queries:
   - Use hybrid_search to combine sources
   - Set appropriate filters for both database and web
   - Prioritize academic sources

4. For technical queries:
   - Use web_search with technical source types
   - Include version numbers when relevant
   - Link to official documentation

Remember:
- Always verify information accuracy
- Cross-reference multiple sources
- Be transparent about source limitations
- Provide context for information
- Include relevant timestamps
- Format course information properly

When mentioning any course, ALWAYS use the format "**Course Code: Course Title**" in bold. For example: "**CS 5785: Applied Machine Learning**" or "**INFO 5100: Application Programming and Design**".`;

export class OpenAIService {
    static getSystemPrompt(): ChatCompletionMessageParam {
        return {
            role: "system",
            content: `You are an intelligent and helpful assistant for Cornell Tech students. Your primary goal is to provide accurate, relevant, and helpful information about courses and academic matters. You should:

1. Always use the appropriate functions to search for information:
   - For course searches, ALWAYS use search_courses first
   - For specific course details, use get_course_details
   - For reviews, use get_course_reviews
   - For schedules, use get_course_schedule
   - For requirements, use get_course_requirements

2. When searching for courses:
   - Include relevant filters (department, semester, etc.)
   - Format course information with proper course codes in bold
   - Provide context and explanations for recommendations
   - Consider program-specific requirements

3. For course recommendations:
   - Consider the user's program and background
   - Look at course reviews and ratings
   - Check prerequisites and requirements
   - Consider course schedules and availability
   - Suggest complementary courses

4. Always be helpful and friendly:
   - Provide clear, well-structured responses
   - Use examples and specific details
   - Be honest about limitations
   - Suggest alternatives when appropriate

Remember to ALWAYS use the search_courses function when looking for courses, and format course codes in bold (e.g., **CS 5785: Applied Machine Learning**).`,
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
            ? `You are an intelligent and helpful assistant for Cornell Tech students. The user is in the ${program} program. Your primary goal is to provide accurate, relevant, and helpful information about courses and academic matters.

When suggesting courses for the ${program} program:
1. ALWAYS use the search_courses function first
2. Consider program-specific requirements and recommendations
3. Look for courses that align with the program's focus
4. Include both required and elective courses
5. Consider the user's background and interests

Remember to format course codes in bold (e.g., **CS 5785: Applied Machine Learning**).`
            : this.getSystemPrompt();

        if (searchContext) {
            let contextPrompt = `\n\nBased on the user's query, I've determined this is a ${searchContext.queryType} type question with ${Math.round(searchContext.confidence * 100)}% confidence.`;

            if (searchContext.secondaryType) {
                contextPrompt += ` There's also a secondary ${searchContext.secondaryType} aspect with ${Math.round(searchContext.secondaryConfidence! * 100)}% confidence.`;
            }

            contextPrompt += `\nThe following sources will be prioritized: ${searchContext.sources.join(", ")}.`;

            // Add specific guidance based on query type
            if (searchContext.queryType === "course") {
                contextPrompt += `\nFor course-related queries, ALWAYS use the search_courses function first with appropriate filters. If no specific filters are mentioned, use a broad search to find relevant courses. Include course codes in bold format (e.g., **CS 5785: Applied Machine Learning**).`;

                // Add program-specific guidance if available
                if (program) {
                    contextPrompt += `\nSince the user is in the ${program} program, make sure to consider program-specific requirements and recommendations when suggesting courses.`;
                }
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
                        tools: functions.map((func) => ({
                            type: "function",
                            function: func,
                        })),
                        tool_choice: "auto",
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
                        tools: functions.map((func) => ({
                            type: "function",
                            function: func,
                        })),
                        tool_choice: "auto",
                        user: userId,
                    };
                    const res = await openai.chat.completions.create(req);

                    // Handle function calls
                    const message = res.choices[0]?.message;
                    if (message?.tool_calls) {
                        const toolCall = message.tool_calls[0];
                        const functionName = toolCall.function.name;
                        const functionArgs = JSON.parse(
                            toolCall.function.arguments || "{}"
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
                                    const searchArgs = {
                                        ...functionArgs,
                                        // Add program-specific filters if available
                                        ...(program ? { program } : {}),
                                    };
                                    functionResult =
                                        await this.searchCoursesDatabase(
                                            searchArgs.query,
                                            searchArgs
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
                                                ...(program ? { program } : {}),
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
                                        await this.handleFunctionCall(toolCall);
                                }
                            } else {
                                // No search context, use original function handling
                                functionResult =
                                    await this.handleFunctionCall(toolCall);
                            }

                            // Add function result to messages and get a new response
                            messages.push({
                                role: "assistant",
                                content: null,
                                tool_calls: [toolCall],
                            });
                            messages.push({
                                role: "tool",
                                tool_call_id: toolCall.id,
                                content: functionResult || "{}",
                            });

                            // Get a new response with the function result
                            const secondResponse =
                                await openai.chat.completions.create({
                                    messages,
                                    model,
                                    tools: functions.map((func) => ({
                                        type: "function",
                                        function: func,
                                    })),
                                    tool_choice: "auto",
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
                    } else if (message?.content) {
                        // If there's a direct response without tool calls, return it
                        return {
                            response: res,
                            costLog: {
                                model,
                                promptTokens: res.usage?.prompt_tokens || 0,
                                completionTokens:
                                    res.usage?.completion_tokens || 0,
                                totalTokens: res.usage?.total_tokens || 0,
                                cost:
                                    ((res.usage?.total_tokens || 0) / 1000) *
                                    modelCost,
                                timestamp,
                            },
                        };
                    } else {
                        // If there's no content and no tool calls, try to force a tool call
                        const forcedResponse =
                            await openai.chat.completions.create({
                                messages: [
                                    ...messages,
                                    {
                                        role: "system",
                                        content:
                                            "Please use the search_courses tool to search for courses.",
                                    },
                                ],
                                model,
                                tools: functions.map((func) => ({
                                    type: "function",
                                    function: func,
                                })),
                                tool_choice: {
                                    type: "function",
                                    function: { name: "search_courses" },
                                },
                                user: userId,
                            });

                        if (forcedResponse.choices[0]?.message?.tool_calls) {
                            const toolCall =
                                forcedResponse.choices[0].message.tool_calls[0];
                            const functionResult =
                                await this.handleFunctionCall(toolCall);

                            messages.push({
                                role: "assistant",
                                content: null,
                                tool_calls: [toolCall],
                            });
                            messages.push({
                                role: "tool",
                                tool_call_id: toolCall.id,
                                content: functionResult || "{}",
                            });

                            const finalResponse =
                                await openai.chat.completions.create({
                                    messages,
                                    model,
                                    tools: functions.map((func) => ({
                                        type: "function",
                                        function: func,
                                    })),
                                    tool_choice: "auto",
                                    user: userId,
                                });

                            return {
                                response: finalResponse,
                                costLog: {
                                    model,
                                    promptTokens:
                                        finalResponse.usage?.prompt_tokens || 0,
                                    completionTokens:
                                        finalResponse.usage
                                            ?.completion_tokens || 0,
                                    totalTokens:
                                        finalResponse.usage?.total_tokens || 0,
                                    cost:
                                        ((finalResponse.usage?.total_tokens ||
                                            0) /
                                            1000) *
                                        modelCost,
                                    timestamp,
                                },
                            };
                        }
                    }

                    // If we get here, something went wrong
                    throw new Error("Failed to generate a response");
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
            // Always query the database first
            const results = await DatabaseService.searchCourses(
                query,
                filters?.department,
                filters?.semester,
                filters?.year,
                filters?.minCredits,
                filters?.maxCredits,
                filters?.category
            );

            if (results.length === 0) {
                return (
                    "I couldn't find any courses matching your query. Please try:\n" +
                    "1. Using the course code (e.g., CS5112)\n" +
                    "2. Using a shorter search term\n" +
                    "3. Checking the spelling of the course name"
                );
            }

            // Get detailed review information for each course
            const coursesWithReviews = await Promise.all(
                results.map(async (course) => {
                    const reviews = await DatabaseService.getCourseReviews(
                        course.id
                    );
                    return {
                        ...course,
                        reviews,
                        reviewCount: reviews.length,
                        avgRating:
                            reviews.length > 0
                                ? reviews.reduce(
                                      (acc: number, r: CourseReview) =>
                                          acc + r.overall_rating,
                                      0
                                  ) / reviews.length
                                : 0,
                        avgDifficulty:
                            reviews.length > 0
                                ? reviews.reduce(
                                      (acc: number, r: CourseReview) =>
                                          acc + r.difficulty,
                                      0
                                  ) / reviews.length
                                : 0,
                        avgWorkload:
                            reviews.length > 0
                                ? reviews.reduce(
                                      (acc: number, r: CourseReview) =>
                                          acc + r.workload,
                                      0
                                  ) / reviews.length
                                : 0,
                    };
                })
            );

            // Group results by course name and professor
            const courseMap = new Map<string, CourseWithReviews>();
            coursesWithReviews.forEach((course) => {
                const key = `${course.name.toLowerCase()}_${course.professor_id}`;
                if (!courseMap.has(key)) {
                    courseMap.set(key, {
                        ...course,
                        codes: new Set([course.code]),
                        departments: new Set([course.department]),
                    });
                } else {
                    const existingCourse = courseMap.get(key)!;
                    existingCourse.codes.add(course.code);
                    existingCourse.departments.add(course.department);
                    // Merge reviews
                    existingCourse.reviews = [
                        ...existingCourse.reviews,
                        ...course.reviews,
                    ];
                    existingCourse.reviewCount += course.reviewCount;
                    // Recalculate averages
                    existingCourse.avgRating =
                        existingCourse.reviews.reduce(
                            (acc: number, r: CourseReview) =>
                                acc + r.overall_rating,
                            0
                        ) / existingCourse.reviews.length;
                    existingCourse.avgDifficulty =
                        existingCourse.reviews.reduce(
                            (acc: number, r: CourseReview) =>
                                acc + r.difficulty,
                            0
                        ) / existingCourse.reviews.length;
                    existingCourse.avgWorkload =
                        existingCourse.reviews.reduce(
                            (acc: number, r: CourseReview) => acc + r.workload,
                            0
                        ) / existingCourse.reviews.length;
                }
            });

            // Format the response
            return Array.from(courseMap.values())
                .map((course) => {
                    let response = `**${Array.from(course.codes).join(", ")}: ${course.name}**\n`;

                    if (course.description) {
                        response += `${course.description}\n`;
                    }

                    response += `Credits: ${course.credits}\n`;
                    response += `Department(s): ${Array.from(course.departments).join(", ")}\n`;

                    // Add review information
                    if (course.reviewCount > 0) {
                        response += `\nReviews (${course.reviewCount}):\n`;
                        response += `- Average Rating: ${course.avgRating.toFixed(1)}/5.0\n`;
                        response += `- Average Difficulty: ${course.avgDifficulty.toFixed(1)}/5.0\n`;
                        response += `- Average Workload: ${course.avgWorkload.toFixed(1)}/5.0\n\n`;

                        // Add individual reviews
                        response += "Recent Reviews:\n";
                        course.reviews
                            .sort(
                                (a: CourseReview, b: CourseReview) =>
                                    new Date(b.created_at).getTime() -
                                    new Date(a.created_at).getTime()
                            )
                            .slice(0, 3)
                            .forEach((review: CourseReview) => {
                                response += `- "${review.content}" (Rating: ${review.overall_rating}/5.0)\n`;
                            });
                    } else {
                        response += `\nNo reviews available yet. Be the first to review this course!\n`;
                    }

                    return response;
                })
                .join("\n\n");
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
            /find|search|list|show|what|which/i, // Add general search terms
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

        // For general queries without specific context, default to course search
        if (
            query.toLowerCase().includes("what") ||
            query.toLowerCase().includes("find") ||
            query.toLowerCase().includes("show")
        ) {
            return {
                queryType: "course",
                confidence: 0.8,
                sources: ["database"],
                timestamp: new Date().toISOString(),
            };
        }

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

    // Update the handleFunctionCall method to handle the new tool call format
    static async handleFunctionCall(toolCall: any): Promise<string> {
        const {
            function: { name, arguments: args },
        } = toolCall;
        const parsedArgs = JSON.parse(args);

        try {
            switch (name) {
                case "search_courses":
                    // Ensure we have a query, even if it's empty
                    const query = parsedArgs.query || "";
                    // Add default filters if none provided
                    const filters = {
                        ...parsedArgs,
                        query,
                        // Add default filters for better results
                        minCredits: parsedArgs.minCredits || 0,
                        maxCredits: parsedArgs.maxCredits || 6,
                    };
                    return await this.searchCoursesDatabase(query, filters);
                case "web_search":
                    return await this.searchWeb(parsedArgs.query, {
                        maxResults: parsedArgs.maxResults || 5,
                        minRelevance: parsedArgs.minRelevance || 0.7,
                        sourceTypes: parsedArgs.sourceTypes || [
                            "news",
                            "current",
                        ],
                    });
                case "hybrid_search":
                    return await this.hybridSearch(parsedArgs.query, {
                        databaseFilters: parsedArgs.databaseFilters || {},
                        webFilters: parsedArgs.webFilters || {
                            maxResults: 3,
                            minRelevance: 0.8,
                            sourceTypes: ["academic", "research"],
                        },
                    });
                case "get_course_details":
                    return await this.searchCoursesDatabase(
                        parsedArgs.courseId,
                        {
                            exactMatch: true,
                            includeReviews: true,
                            includeRequirements: true,
                        }
                    );
                case "get_course_reviews":
                    return await this.searchCoursesDatabase(
                        parsedArgs.courseId,
                        {
                            includeReviews: true,
                            minRating: parsedArgs.minRating || 0,
                            maxRating: parsedArgs.maxRating || 5,
                        }
                    );
                case "get_course_schedule":
                    return await this.searchCoursesDatabase(
                        parsedArgs.courseId,
                        {
                            semester: parsedArgs.semester,
                            year: parsedArgs.year,
                            includeSchedule: true,
                        }
                    );
                case "get_course_requirements":
                    return await this.searchCoursesDatabase(
                        parsedArgs.courseId,
                        {
                            includeRequirements: true,
                        }
                    );
                case "get_course_categories":
                    return await this.searchCoursesDatabase("", {
                        listCategories: true,
                    });
                default:
                    throw new Error(`Unknown function: ${name}`);
            }
        } catch (error: any) {
            console.error(`Error executing ${name}:`, error);
            // Provide a more helpful error message
            if (name === "search_courses") {
                return "I encountered an error while searching for courses. Please try again with a different search term or more specific criteria.";
            }
            return `Error executing ${name}: ${error.message}`;
        }
    }

    // Add response formatting functions
    static formatCourseResponse(results: any[]): string {
        if (!results.length) {
            return "I couldn't find any courses matching your query. Please try a different search term or check the spelling.";
        }

        return results
            .map((course) => {
                const code = course.code || "";
                const title = course.title || course.name || "No Title";
                let response = `**${code}: ${title}**\n`;

                if (course.description) {
                    response += `${course.description}\n`;
                }

                response += `Credits: ${course.credits}\n`;
                response += `Department: ${course.department}\n`;

                if (course.prerequisites) {
                    response += `Prerequisites: ${course.prerequisites}\n`;
                }

                if (course.semester) {
                    response += `Offered: ${course.semester}\n`;
                }

                if (course.instructor) {
                    response += `Instructor: ${course.instructor}\n`;
                }

                if (course.reviews && course.reviews.length > 0) {
                    const avgRating =
                        course.reviews.reduce(
                            (acc: number, review: any) => acc + review.rating,
                            0
                        ) / course.reviews.length;
                    response += `Average Rating: ${avgRating.toFixed(1)}/5.0\n`;
                }

                return response;
            })
            .join("\n");
    }

    static formatWebResponse(results: any[]): string {
        if (!results.length) {
            return "I couldn't find any recent information matching your query. Please try a different search term or check the spelling.";
        }

        return results
            .map((result) => {
                const source = result.source || "Unknown Source";
                const date = new Date().toLocaleDateString();
                let response = `According to ${source} (accessed ${date}):\n`;

                if (result.snippet) {
                    response += `${result.snippet}\n`;
                }

                if (result.link) {
                    response += `Source: ${result.link}\n`;
                }

                if (result.relevance) {
                    response += `Relevance: ${(result.relevance * 100).toFixed(0)}%\n`;
                }

                return response;
            })
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

        if (!response) {
            return "I couldn't find any relevant information from either source. Please try a different search term or check the spelling.";
        }

        return response;
    }

    static formatTechnicalResponse(results: any[]): string {
        if (!results.length) {
            return "I couldn't find any technical documentation matching your query. Please try a different search term or check the spelling.";
        }

        return results
            .map((result) => {
                const source = result.source || "Unknown Source";
                const version = result.version || "latest";
                let response = `According to ${source} (${version}):\n`;

                if (result.snippet) {
                    response += `${result.snippet}\n`;
                }

                if (result.link) {
                    response += `Documentation: ${result.link}\n`;
                }

                if (result.relevance) {
                    response += `Relevance: ${(result.relevance * 100).toFixed(0)}%\n`;
                }

                return response;
            })
            .join("\n");
    }
}
