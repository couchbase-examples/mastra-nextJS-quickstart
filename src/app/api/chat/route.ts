import { researchAgent } from "@/mastra/agents/researchAgent";

// Accepted roles coming from the client
export type Role = "user" | "assistant" | "system";

export interface MatraMessage {
  role: Role;
  content: string;
}

// Type-guard used both for runtime validation and to satisfy TypeScript
function isMatraMessage(msg: unknown): msg is MatraMessage {
  if (typeof msg !== "object" || msg === null) {
    return false;
  }

  const candidate = msg as {
    role?: unknown;
    content?: unknown;
  };

  return (
    typeof candidate.content === "string" &&
    (candidate.role === "user" || candidate.role === "assistant" || candidate.role === "system")
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const messages = body.messages as unknown[];

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("No messages provided.");
  }

  // Validate message structure at runtime using the type-guard
  if (!messages.every(isMatraMessage)) {
    throw new Error(
      "Invalid message format. Each message must have 'role' and 'content' properties."
    );
  }

  // messages is now MatraMessage[] thanks to the guard above
  const matraMessages: MatraMessage[] = messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  try {
    const stream = await researchAgent.stream(matraMessages);
    return stream.toDataStreamResponse({
      sendUsage: true,
      sendReasoning: true,
      getErrorMessage: error =>
        `An error occurred while processing your request. ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
    });
  } catch (error) {
    console.error("Error in research agent stream:", error);
    throw error;
  }
}
