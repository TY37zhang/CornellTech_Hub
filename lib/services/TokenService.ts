import { sql } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export interface UserTokenUsage {
    id: string;
    user_id: string;
    month_year: string; // 'YYYY-MM'
    tokens_used: number;
    created_at: string;
    updated_at: string;
}

export interface ChatConversation {
    id: string;
    user_id: string;
    title: string | null;
    created_at: string;
    updated_at: string;
}

export interface ChatMessage {
    id: string;
    conversation_id: string;
    user_id: string | null;
    role: "user" | "assistant" | "system";
    content: string;
    tokens: number;
    error: boolean;
    created_at: string;
}

function getNYCMonthYear(date = new Date()): string {
    const nyc = new Date(
        date.toLocaleString("en-US", { timeZone: "America/New_York" })
    );
    return `${nyc.getFullYear()}-${String(nyc.getMonth() + 1).padStart(2, "0")}`;
}

export function getNextMonthNYCMidnight(): Date {
    const now = new Date();
    const nyc = new Date(
        now.toLocaleString("en-US", { timeZone: "America/New_York" })
    );
    const year = nyc.getFullYear();
    const month = nyc.getMonth();
    return new Date(Date.UTC(year, month + 1, 1, 4, 0, 0)); // 04:00 UTC = 00:00 NYC (EDT)
}

export class TokenService {
    static readonly MONTHLY_LIMIT = 1000000; // 1M tokens per month

    static async getUserUsage(userId: string): Promise<UserTokenUsage> {
        const now = new Date();
        const monthYear = getNYCMonthYear();

        // Get or create user token usage record
        const result = await sql`
            INSERT INTO user_token_usage (user_id, month_year, tokens_used, created_at, updated_at)
            VALUES (${userId}, ${monthYear}, 0, ${now.toISOString()}, ${now.toISOString()})
            ON CONFLICT (user_id, month_year) DO UPDATE
            SET updated_at = ${now.toISOString()}
            RETURNING *
        `;
        return result[0];
    }

    static async updateTokenUsage(
        userId: string,
        tokens: number
    ): Promise<void> {
        const now = new Date();
        const monthYear = getNYCMonthYear();

        await sql`
            UPDATE user_token_usage
            SET tokens_used = tokens_used + ${tokens},
                updated_at = ${now.toISOString()}
            WHERE user_id = ${userId} AND month_year = ${monthYear}
        `;
    }

    static async canStartConversation(
        userId: string,
        tokensNeeded: number
    ): Promise<boolean> {
        const usage = await this.getUserUsage(userId);
        return usage.tokens_used + tokensNeeded <= this.MONTHLY_LIMIT;
    }

    static async createConversation(
        userId: string,
        title: string | null,
        firstMessage: {
            content: string;
            tokens: number;
            role: "user" | "assistant" | "system";
        }
    ): Promise<ChatConversation> {
        if (!(await this.canStartConversation(userId, firstMessage.tokens))) {
            throw new Error("Monthly token limit exceeded");
        }
        const conversationId = uuidv4();
        const now = new Date();
        await sql`
      INSERT INTO chat_conversations (id, user_id, title, created_at, updated_at)
      VALUES (${conversationId}, ${userId}, ${title}, ${now.toISOString()}, ${now.toISOString()})
    `;
        const messageId = uuidv4();
        await sql`
      INSERT INTO chat_messages (id, conversation_id, user_id, role, content, tokens, created_at)
      VALUES (${messageId}, ${conversationId}, ${userId}, ${firstMessage.role}, ${firstMessage.content}, ${firstMessage.tokens}, ${now.toISOString()})
    `;
        await sql`
      UPDATE user_token_usage
      SET tokens_used = tokens_used + ${firstMessage.tokens}, updated_at = ${now.toISOString()}
      WHERE user_id = ${userId} AND month_year = ${getNYCMonthYear()}
    `;
        const conv = await sql`
      SELECT * FROM chat_conversations WHERE id = ${conversationId}
    `;
        return conv[0];
    }

    static async resetMonthlyLimits() {
        const monthYear = getNYCMonthYear();
        await sql`
      DELETE FROM user_token_usage WHERE month_year != ${monthYear}
    `;
    }
}
