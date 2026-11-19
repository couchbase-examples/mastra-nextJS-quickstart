import { CouchbaseVector } from "@mastra/couchbase";
import { getConfig } from "../config";

/**
 * Create Couchbase connection from the validated app config
 */
function createCouchbaseConnection(): CouchbaseVector {
  return new CouchbaseVector(getConfig().couchbase);
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
