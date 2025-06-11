import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { vectorQueryTool } from "../tools/embed";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
 
export const researchAgent = new Agent({
  name: "Research Assistant",
  instructions: `You are a helpful research assistant that analyzes academic papers and technical documents.
    Use the provided vector query tool to find relevant information from your knowledge base, 
    and provide accurate, well-supported answers based on the retrieved content.
    
    Available tools:
    - vector_query: Semantic search for document chunks with configurable parameters
    
    Focus on the specific content available in the tool and acknowledge if you cannot find sufficient information to answer a question.
    Base your responses only on the content provided, not on general knowledge.
    Always cite the source documents when providing information.`,
  model: openai("gpt-4o-mini"),
  tools: {
    vectorQueryTool,
  },
  memory: new Memory({
        storage: new LibSQLStore({
            url: "file:../../memory.db"
        })
    }),
});