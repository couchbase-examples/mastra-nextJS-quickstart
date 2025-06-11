import { NextResponse } from "next/server";
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import { CouchbaseVector } from '@mastra/couchbase';
import { MDocument } from "@mastra/rag";
import { writeFile } from "fs/promises";
import path from "path";
import { existsSync, mkdirSync } from "fs";
import pdfParse from 'pdf-parse';


// List of required environment variables
const REQUIRED_ENV_VARS = {
    EMBEDDING_MODEL: 'string',
    EMBEDDING_DIMENSION: 'number',
    EMBEDDING_BATCH_SIZE: 'number',
    CHUNK_SIZE: 'number',
    CHUNK_OVERLAP: 'number',
    VECTOR_INDEX_NAME: 'string',
    VECTOR_INDEX_METRIC: 'string',
    COUCHBASE_CONNECTION_STRING: 'string',
    COUCHBASE_USERNAME: 'string',
    COUCHBASE_PASSWORD: 'string',
    COUCHBASE_BUCKET_NAME: 'string',
    COUCHBASE_SCOPE_NAME: 'string',
    COUCHBASE_COLLECTION_NAME: 'string'
} as const;
// Function to validate environment variables
function validateEnvVars() {
    const missingVars: string[] = [];
    for (const [varName, type] of Object.entries(REQUIRED_ENV_VARS)) {
        const value = process.env[varName];
        if (!value) {
            missingVars.push(varName);
            continue;
        }
        if (type === 'number' && isNaN(parseInt(value))) {
            missingVars.push(`${varName} (must be a number)`);
        }
    }
    if (missingVars.length > 0) {
        throw new Error(`Missing or invalid environment variables: ${missingVars.join(', ')}`);
    }
}
validateEnvVars();

// Configuration objects using validated environment variables
const EMBEDDING_CONFIG = {
    model: process.env.EMBEDDING_MODEL as string,
    dimension: parseInt(process.env.EMBEDDING_DIMENSION!),
    batchSize: parseInt(process.env.EMBEDDING_BATCH_SIZE!),
};
const CHUNKING_CONFIG = {
    chunkSize: parseInt(process.env.CHUNK_SIZE!),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP!),
};
const INDEX_CONFIG = {
    indexName: process.env.VECTOR_INDEX_NAME as string,
    metric: process.env.VECTOR_INDEX_METRIC as 'cosine' | 'euclidean' | 'dotproduct',
};
const COUCHBASE_CONFIG = {
    connectionString: process.env.COUCHBASE_CONNECTION_STRING!,
    username: process.env.COUCHBASE_USERNAME!,
    password: process.env.COUCHBASE_PASSWORD!,
    bucketName: process.env.COUCHBASE_BUCKET_NAME!,
    scopeName: process.env.COUCHBASE_SCOPE_NAME!,
    collectionName: process.env.COUCHBASE_COLLECTION_NAME!,
};


/**
 * Read document from buffer - supports only PDF formats
 * @param fileBuffer - The PDF file buffer
 * @param fileName - The name of the file (used for logging)
 * @returns The extracted text content from the PDF
 */
async function readDocument(fileBuffer: Buffer, fileName: string): Promise<string> {
    try {
        // Use pdf-parse for simple and reliable PDF text extraction
        const data = await pdfParse(fileBuffer);
        return data.text;
    } catch (error) {
        console.error(`Error reading document from ${fileName}:`, error);
        throw error;
    }
}
/**
 * Connect to Couchbase using environment variables
 */
function connectToCouchbase(): CouchbaseVector {
    const connectionString = COUCHBASE_CONFIG.connectionString;
    const username = COUCHBASE_CONFIG.username;
    const password = COUCHBASE_CONFIG.password;
    const bucketName = COUCHBASE_CONFIG.bucketName;
    const scopeName = COUCHBASE_CONFIG.scopeName;
    const collectionName = COUCHBASE_CONFIG.collectionName;

    return new CouchbaseVector({
        connectionString,
        username,
        password,
        bucketName,
        scopeName,
        collectionName,
    });
}
/**
 * Main function to process document and create embeddings
 * @param documentText - The text content of the document
 * @param fileName - The name of the file (used for logging)
 */
async function createDocumentEmbeddings(documentText: string, fileName: string): Promise<void> {
    try {
        console.info('Starting document embedding process...');

        // Step 1: Connect to Couchbase
        console.info('Connecting to Couchbase...');
        const vectorStore = connectToCouchbase();
        console.info('Successfully connected to Couchbase');

        // Step 2: Create search index
        console.info('Creating search index...');
        try {
            await vectorStore.createIndex({
                indexName: INDEX_CONFIG.indexName,
                dimension: EMBEDDING_CONFIG.dimension,
                metric: INDEX_CONFIG.metric,
            });
            console.info('Successfully created search index');
        } catch (error) {
            console.warn(`Index creation warning (index might already exist): ${error}`);
            // Continue anyway - index might already exist
        }

        // Step 3: Read and chunk document
        console.info(`${fileName} Document length: ${documentText.length} characters`);

        console.info(`Chunking ${fileName} document...`);
        const doc = MDocument.fromText(documentText);
        const chunks = await doc.chunk({
            size: 100,
            overlap: 50,
            separator: "\n",
            stripHeaders: true,
            addStartIndex: true,
        });
        console.info(`Created ${chunks.length} chunks`);
        
        // Step 4: Generate embeddings
        console.info('Generating embeddings...');
        const { embeddings } = await embedMany({ 
            model: openai.embedding(EMBEDDING_CONFIG.model),
            values: chunks.map((chunk) => chunk.text),
        });
        console.info(`Generated ${embeddings.length} embeddings`);

        // Step 5: Prepare metadata and IDs
        const metadatas = chunks.map((chunk, index) => ({
            text: chunk.text,
            chunkIndex: index,
            timestamp: new Date().toISOString(),
            start: chunk.metadata?.startIndex,
            end: chunk.metadata?.startIndex !== undefined ? chunk.metadata.startIndex + chunk.text.length : undefined,
        }));

        const ids = chunks.map((_, index) => `${fileName}_chunk_${index}`);

        // Step 6: Upsert vectors
        console.info('Upserting vectors to Couchbase...');
        await vectorStore.upsert({
            indexName: INDEX_CONFIG.indexName,
            vectors: embeddings,
            metadata: metadatas,
            ids,
        });

        console.info(`Successfully upserted ${embeddings.length} vectors`);
        console.info('Document embedding process completed successfully!');

    } catch (error) {
        console.error(`Error in document embedding process for ${fileName}:`, error);
        throw error;
    }
}


export async function POST(request: Request) {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create public/assets directory if it doesn't exist and write the file to it
        if (!existsSync(path.join(process.cwd(), "public/assets"))) {
            mkdirSync(path.join(process.cwd(), "public/assets"));
        }
        await writeFile(
            path.join(process.cwd(), "public/assets", file.name),
            buffer
        );
        const documentText = await readDocument(buffer, file.name);
        await createDocumentEmbeddings(documentText, file.name);

    } catch (error) {
        console.log("error", error);
        return NextResponse.json({ error: "Failed to ingest your data" });
    }

    return NextResponse.json({
        text: "Successfully embedded pdf",
        fileName: file.name,
    });
}
