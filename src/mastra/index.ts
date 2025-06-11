import { Mastra } from "@mastra/core"; 
import { researchAgent } from "./agents/researchAgent";
 
// Initialize Mastra instance
export const mastra = new Mastra({
    agents: { researchAgent }
});