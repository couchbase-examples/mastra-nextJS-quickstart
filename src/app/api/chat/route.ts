import { CouchbaseVector } from "@mastra/couchbase";
import { Message as VercelChatMessage } from "ai";
import { researchAgent } from "@/mastra/agents/researchAgent";
import { NextResponse } from "next/server";

interface MatraMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export async function POST(request: Request) {
    const body = await request.json();
    const messages = body.messages ?? [];
    if (!messages.length) {
        throw new Error("No messages provided.");
    }
    // Validate message structure
    if (!messages.every((msg: any) => msg.role && msg.content)) {
        throw new Error("Invalid message format. Each message must have 'role' and 'content' properties.");
    }

    const matraMessages: MatraMessage[] = messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
    }));

    try {
        const stream = await researchAgent.stream(matraMessages);
        const streamResponse = stream.toDataStreamResponse({
            sendUsage: true,
            sendReasoning: true,
            getErrorMessage: (error) => {
                return `An error occurred while processing your request. ${error instanceof Error ? error.message : JSON.stringify(error)}`;
            }
        });
        return streamResponse;
    } catch (error) {
        console.error("Error in research agent stream:", error);
        throw error;
    }
}
