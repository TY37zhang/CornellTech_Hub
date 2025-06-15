import { TokenService, getNextMonthNYCMidnight } from "./TokenService";

const TEST_USER_ID = process.argv[2] || "00000000-0000-0000-0000-000000000001";

async function run() {
    try {
        console.log("--- TokenService CLI Test ---");
        console.log("User:", TEST_USER_ID);

        // 1. Get user usage
        const usage = await TokenService.getUserUsage(TEST_USER_ID);
        console.log("Current usage:", usage);

        // 2. Can start conversation with 100 tokens?
        const canStart = await TokenService.canStartConversation(
            TEST_USER_ID,
            100
        );
        console.log("Can start conversation with 100 tokens:", canStart);

        // 3. Create a conversation (if allowed)
        if (canStart) {
            const conversation = await TokenService.createConversation(
                TEST_USER_ID,
                "CLI Test Conversation",
                { content: "Hello from CLI test!", tokens: 100, role: "user" }
            );
            console.log("Created conversation:", conversation);
        } else {
            console.log("User cannot start a new conversation (limit reached)");
        }

        // 4. Get usage again
        const usageAfter = await TokenService.getUserUsage(TEST_USER_ID);
        console.log("Usage after conversation:", usageAfter);

        // 5. Reset monthly limits (simulate cron job)
        await TokenService.resetMonthlyLimits();
        console.log("Monthly limits reset (old months deleted)");

        // 6. Get usage after reset
        const usageReset = await TokenService.getUserUsage(TEST_USER_ID);
        console.log("Usage after reset:", usageReset);

        // 7. Show next NYC midnight
        console.log(
            "Next NYC midnight (first of next month):",
            getNextMonthNYCMidnight()
        );
    } catch (err) {
        console.error("Error in TokenService CLI test:", err);
    }
}

run();
