import { CouchbaseVector } from "@mastra/couchbase";

/**
 * Create Couchbase connection using environment variables
 */
function createCouchbaseConnection(): CouchbaseVector {
  const connectionString = process.env.COUCHBASE_CONNECTION_STRING;
  const username = process.env.COUCHBASE_USERNAME;
  const password = process.env.COUCHBASE_PASSWORD;
  const bucketName = process.env.COUCHBASE_BUCKET_NAME;
  const scopeName = process.env.COUCHBASE_SCOPE_NAME;
  const collectionName = process.env.COUCHBASE_COLLECTION_NAME;

  if (!connectionString || !username || !password || !bucketName || !scopeName || !collectionName) {
    throw new Error('Missing required Couchbase environment variables. Please check your .env file.');
  }

  return new CouchbaseVector({
    connectionString,
    username,
    password,
    bucketName,
    scopeName,
    collectionName,
  });
}

// Singleton pattern - create connection once and reuse
let vectorStoreInstance: CouchbaseVector | null = null;

/**
 * Get or create the shared vector store connection
 */
export function getVectorStore(): CouchbaseVector {
  if (!vectorStoreInstance) {
    console.log('Creating new Couchbase vector store connection...');
    vectorStoreInstance = createCouchbaseConnection();
    console.log('Couchbase vector store connection established');
  }
  return vectorStoreInstance;
}

/**
 * Close the vector store connection (useful for cleanup)
 */
export function closeVectorStore(): void {
  if (vectorStoreInstance) {
    console.log('Closing Couchbase vector store connection...');
    // If CouchbaseVector has a close method, call it here
    // vectorStoreInstance.close();
    vectorStoreInstance = null;
  }
}

// Export the instance directly for convenience
export const vectorStore = getVectorStore(); 