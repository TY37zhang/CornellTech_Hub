import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";
import { OpenAIService } from "@/lib/services/OpenAIService";
import { TokenService } from "@/lib/services/TokenService";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { DatabaseService } from "@/lib/services/DatabaseService";
import { executeQuery } from "@/lib/db";
import { SearchService } from "@/lib/services/SearchService";

interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

interface DBChatMessage {
    role: string;
    content: string;
}

// Helper to create a new conversation and return its id
async function createConversation(userId: string) {
    const conversationId = randomUUID();
    try {
        await executeQuery(
            `INSERT INTO chat_conversations (id, user_id, created_at)
             VALUES ($1, $2, CURRENT_TIMESTAMP)`,
            [conversationId, userId]
        );
        return conversationId;
    } catch (error) {
        console.error("Error creating conversation:", error);
        throw new Error("Failed to create conversation");
    }
}

// Helper to save a chat message
async function saveChatMessage(
    messageId: string,
    conversationId: string,
    userId: string,
    role: string,
    content: string,
    tokens: number,
    error: boolean = false
) {
    try {
        const result = await executeQuery(
            `INSERT INTO chat_messages 
             (id, conversation_id, user_id, role, content, tokens, error, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
             RETURNING id, conversation_id, user_id, role, content, tokens, error, created_at`,
            [messageId, conversationId, userId, role, content, tokens, error]
        );
        return result[0];
    } catch (error) {
        console.error("Error saving chat message:", error);
        throw new Error("Failed to save chat message");
    }
}

// Helper to get chat history
async function getChatHistory(
    conversationId: string
): Promise<DBChatMessage[]> {
    try {
        const result = await executeQuery(
            `SELECT role, content 
             FROM chat_messages 
             WHERE conversation_id = $1 
             ORDER BY created_at ASC 
             LIMIT 20`,
            [conversationId]
        );
        return result as DBChatMessage[];
    } catch (error) {
        console.error("Error fetching chat history:", error);
        return [];
    }
}

// Helper to determine if a message needs web search
function needsWebSearch(message: string): boolean {
    const searchTriggers = [
        "search for",
        "find information about",
        "look up",
        "what is",
        "who is",
        "where is",
        "how to",
        "tell me about",
        "information about",
        "details about",
        "latest news about",
        "current status of",
        "recent developments in",
    ];

    const lowerMessage = message.toLowerCase();
    return searchTriggers.some((trigger) => lowerMessage.includes(trigger));
}

// Helper to format search results for the assistant
function formatSearchResults(results: any[]): string {
    if (!results || results.length === 0) return "";

    return `\n\nRelevant information from web search:\n${results
        .map(
            (result, index) =>
                `${index + 1}. ${result.title}\nSource: ${result.source}\n${result.snippet}\n`
        )
        .join("\n")}`;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { message, conversation_id, stream } = await req.json();
        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Validate message length
        if (message.length > 4000) {
            return NextResponse.json(
                {
                    error: "Message is too long. Maximum length is 4000 characters.",
                },
                { status: 400 }
            );
        }

        // Check token usage before proceeding
        const estimatedTokens = Math.floor(message.length / 4); // Rough estimate
        if (
            !(await TokenService.canStartConversation(
                session.user.id,
                estimatedTokens
            ))
        ) {
            return NextResponse.json(
                { error: "Monthly token limit exceeded" },
                { status: 429 }
            );
        }

        let convId = conversation_id;
        if (!convId) {
            convId = await createConversation(session.user.id);
        }

        // Save user message
        const userMsgId = randomUUID();
        const userMsgRes = await saveChatMessage(
            userMsgId,
            convId,
            session.user.id,
            "user",
            message,
            estimatedTokens
        );

        // Get chat history
        const chatHistory = await getChatHistory(convId);
        const openaiMessages: ChatCompletionMessageParam[] = chatHistory.map(
            (msg: DBChatMessage) => ({
                role: msg.role as "user" | "assistant" | "system",
                content: msg.content,
            })
        );

        // Check if we need to perform a web search
        let searchResults = null;
        if (needsWebSearch(message)) {
            try {
                const searchService = new SearchService();
                const searchResponse = await searchService.search(message, {
                    maxResults: 3,
                    minRelevance: 0.6,
                    useCache: true,
                });
                searchResults = searchResponse.results;
            } catch (error) {
                console.error("Search error:", error);
                // Continue without search results if search fails
            }
        }

        // Add user message with search results if available
        const userMessageContent = searchResults
            ? `${message}${formatSearchResults(searchResults)}`
            : message;
        openaiMessages.push({ role: "user", content: userMessageContent });

        try {
            // Get assistant response from OpenAIService
            const { response, costLog } = await OpenAIService.chat(
                openaiMessages,
                "gpt-4.1-mini",
                false,
                session.user.id,
                session.user.program
            );
            const chatResponse =
                response as import("openai/resources/chat/completions").ChatCompletion;
            const assistantContent =
                chatResponse.choices[0]?.message?.content ||
                "Sorry, I could not generate a response.";

            // Log token usage
            console.log("OpenAI Token Usage:", {
                promptTokens: costLog.promptTokens,
                completionTokens: costLog.completionTokens,
                totalTokens: costLog.totalTokens,
                usage: chatResponse.usage,
                costLog,
            });

            // Update token usage
            await TokenService.updateTokenUsage(
                session.user.id,
                costLog.totalTokens
            );

            // Save assistant message
            const assistantMsgId = randomUUID();
            const assistantMsgRes = await saveChatMessage(
                assistantMsgId,
                convId,
                session.user.id,
                "assistant",
                assistantContent,
                costLog.completionTokens
            );

            // Update user message with exact token count
            try {
                await executeQuery(
                    `UPDATE chat_messages 
                     SET tokens = $1
                     WHERE id = $2`,
                    [costLog.promptTokens - costLog.completionTokens, userMsgId]
                );
            } catch (error) {
                console.error("Error updating user message tokens:", error);
                // Non-critical error, continue
            }

            return NextResponse.json({
                conversation_id: convId,
                userMessage: userMsgRes,
                assistantMessage: assistantMsgRes,
                costLog,
                searchResults: searchResults || [],
            });
        } catch (error: any) {
            // Handle specific error types
            if (error.message.includes("rate limit exceeded")) {
                return NextResponse.json(
                    {
                        error: "Rate limit exceeded. Please try again in a few minutes.",
                    },
                    { status: 429 }
                );
            }
            if (error.message.includes("quota exceeded")) {
                return NextResponse.json(
                    {
                        error: "OpenAI quota exceeded. Please check your billing details and plan limits.",
                    },
                    { status: 429 }
                );
            }
            if (error.message.includes("invalid_request")) {
                return NextResponse.json(
                    {
                        error: "Invalid request. Please check your input and try again.",
                    },
                    { status: 400 }
                );
            }
            if (error.message.includes("authentication")) {
                return NextResponse.json(
                    {
                        error: "Authentication error. Please try logging in again.",
                    },
                    { status: 401 }
                );
            }

            // Save error message
            const errorMsgId = randomUUID();
            await saveChatMessage(
                errorMsgId,
                convId,
                session.user.id,
                "assistant",
                "Sorry, I encountered an error while processing your request. Please try again.",
                0,
                true
            );

            return NextResponse.json(
                {
                    error: "An unexpected error occurred. Please try again.",
                },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            {
                error: "An unexpected error occurred. Please try again.",
            },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const conversation_id = searchParams.get("conversation_id");
        const limit = parseInt(searchParams.get("limit") || "50");
        const cursor = searchParams.get("cursor");

        if (!conversation_id) {
            return NextResponse.json(
                { error: "conversation_id is required" },
                { status: 400 }
            );
        }

        let query = `
            SELECT id, conversation_id, user_id, role, content, tokens, error, created_at
            FROM chat_messages
            WHERE conversation_id = $1
        `;
        const params = [conversation_id];

        if (cursor) {
            query += ` AND id < $${params.length + 1}`;
            params.push(cursor);
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit.toString());

        const messages = (await executeQuery(query, params)) as any[];
        const hasMore = messages.length > limit;
        const messagesToReturn = hasMore ? messages.slice(0, -1) : messages;

        return NextResponse.json({
            messages: messagesToReturn,
            nextCursor: hasMore
                ? messagesToReturn[messagesToReturn.length - 1].id
                : null,
        });
    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
