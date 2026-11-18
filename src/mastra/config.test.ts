import assert from "node:assert/strict";
import { test } from "node:test";
import { loadConfig } from "./config.ts";

const validEnv = {
  EMBEDDING_MODEL: "text-embedding-3-small",
  EMBEDDING_DIMENSION: "1536",
  EMBEDDING_BATCH_SIZE: "100",
  VECTOR_INDEX_NAME: "document-embeddings",
  VECTOR_INDEX_METRIC: "cosine",
  COUCHBASE_CONNECTION_STRING: "couchbase://localhost",
  COUCHBASE_USERNAME: "Administrator",
  COUCHBASE_PASSWORD: "password",
  COUCHBASE_BUCKET_NAME: "bucket",
  COUCHBASE_SCOPE_NAME: "scope",
  COUCHBASE_COLLECTION_NAME: "collection",
};

test("parses a complete environment into typed config", () => {
  assert.deepEqual(loadConfig(validEnv), {
    embedding: { model: "text-embedding-3-small", dimension: 1536, batchSize: 100 },
    index: { indexName: "document-embeddings", metric: "cosine" },
    couchbase: {
      connectionString: "couchbase://localhost",
      username: "Administrator",
      password: "password",
      bucketName: "bucket",
      scopeName: "scope",
      collectionName: "collection",
    },
  });
});

test("reports every missing variable in one error", () => {
  const env: Record<string, string | undefined> = { ...validEnv };
  delete env.COUCHBASE_PASSWORD;
  delete env.EMBEDDING_MODEL;
  assert.throws(() => loadConfig(env), (error: Error) => {
    assert.match(error.message, /EMBEDDING_MODEL/);
    assert.match(error.message, /COUCHBASE_PASSWORD/);
    return true;
  });
});

test("rejects non-numeric and non-positive numbers", () => {
  assert.throws(
    () => loadConfig({ ...validEnv, EMBEDDING_DIMENSION: "abc" }),
    /EMBEDDING_DIMENSION \(must be a positive integer\)/
  );
  assert.throws(
    () => loadConfig({ ...validEnv, EMBEDDING_BATCH_SIZE: "0" }),
    /EMBEDDING_BATCH_SIZE \(must be a positive integer\)/
  );
});

test("rejects an unsupported vector metric", () => {
  assert.throws(
    () => loadConfig({ ...validEnv, VECTOR_INDEX_METRIC: "manhattan" }),
    /VECTOR_INDEX_METRIC \(must be one of: cosine, euclidean, dotproduct\)/
  );
});

test("does not require the unused chunking variables", () => {
  assert.doesNotThrow(() => loadConfig(validEnv));
});
