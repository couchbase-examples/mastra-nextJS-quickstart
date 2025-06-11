import { createTool } from "@mastra/core";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { z } from "zod";
import { getVectorStore } from "./store";

function throwErrorUndefined(env_name: string): never {
    throw new Error(`${env_name} environment variable is required`);
}
// Vector store configuration from environment variables
const EMBEDDING_CONFIG = {
    model: (process.env.EMBEDDING_MODEL || (() => { throwErrorUndefined('EMBEDDING_MODEL') })()) as string,
    dimension: parseInt(process.env.EMBEDDING_DIMENSION || 'undefined') || (() => { throwErrorUndefined('EMBEDDING_DIMENSION') })(),
    batchSize: parseInt(process.env.EMBEDDING_BATCH_SIZE || 'undefined') || (() => { throwErrorUndefined('EMBEDDING_BATCH_SIZE') })(),
};
const INDEX_CONFIG = {
    indexName: (process.env.VECTOR_INDEX_NAME || (() => { throwErrorUndefined('VECTOR_INDEX_NAME') })()) as string,
    metric: (process.env.VECTOR_INDEX_METRIC || (() => { throwErrorUndefined('VECTOR_INDEX_METRIC') })()) as 'cosine' | 'euclidean' | 'dotproduct',
};

/**
 * Vector query tool for semantic search over document embeddings
 */
export const vectorQueryTool = createTool({
    id: "vector_query",
    description: "Search for relevant document chunks based on a semantic query. Returns the most relevant text chunks from the knowledge base.",
    inputSchema: z.object({
        query: z.string().describe("The search query to find relevant document chunks"),
        topK: z.number().optional().default(5).describe("Number of top results to return (default: 5)"),
        minScore: z.number().optional().default(0.1).describe("Minimum similarity score threshold (default: 0.1)"),
    }),
    execute: async (executionContext) => {
        const { query, topK = 5, minScore = 0.1 } = executionContext.context;

        try {
            // Generate embedding for the query
            const { embedding: queryEmbedding } = await embed({
                model: openai.embedding(EMBEDDING_CONFIG.model),
                value: query,
            });

            // Perform vector search using shared connection
            const vectorStore = getVectorStore();
            const results = await vectorStore.query({
                indexName: INDEX_CONFIG.indexName,
                queryVector: queryEmbedding,
                topK,
            });

            // Filter results by minimum score and format response
            const relevantResults = results
                .filter(result => result.score >= minScore)
                .map(result => ({
                    text: result.metadata?.text || 'No text available',
                    score: result.score,
                    chunkIndex: result.metadata?.chunkIndex,
                    documentPath: result.metadata?.documentPath,
                    timestamp: result.metadata?.timestamp,
                }));

            return {
                query,
                totalResults: results.length,
                relevantResults: relevantResults.length,
                minScore,
                chunks: relevantResults,
            };

        } catch (error) {
            console.error('Error in vector query:', error);
            throw new Error(`Vector query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },
});
