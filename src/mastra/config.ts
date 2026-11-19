/**
 * Single source of truth for the app's environment configuration.
 *
 * Both the ingest route and the agent's vector query tool read the same
 * embedding / index / Couchbase settings. Parsing them here keeps the
 * validation rules in one place and defers it until a request needs the
 * values, so `next build` can import route modules without a populated `.env`.
 */

export const VECTOR_METRICS = ["cosine", "euclidean", "dotproduct"] as const;
export type VectorMetric = (typeof VECTOR_METRICS)[number];

export interface AppConfig {
  embedding: {
    model: string;
    dimension: number;
    batchSize: number;
  };
  index: {
    indexName: string;
    metric: VectorMetric;
  };
  couchbase: {
    connectionString: string;
    username: string;
    password: string;
    bucketName: string;
    scopeName: string;
    collectionName: string;
  };
}

type Env = Record<string, string | undefined>;

/**
 * Parse and validate configuration from `env`.
 * Throws one error listing every missing or invalid variable.
 */
export function loadConfig(env: Env = process.env): AppConfig {
  const problems: string[] = [];

  const str = (name: string): string => {
    const value = env[name];
    if (!value) {
      problems.push(name);
      return "";
    }
    return value;
  };

  const positiveInt = (name: string): number => {
    const raw = env[name];
    if (!raw) {
      problems.push(name);
      return 0;
    }
    const value = Number(raw);
    if (!Number.isInteger(value) || value <= 0) {
      problems.push(`${name} (must be a positive integer)`);
    }
    return value;
  };

  const metric = (name: string): VectorMetric => {
    const value = str(name);
    if (value && !(VECTOR_METRICS as readonly string[]).includes(value)) {
      problems.push(`${name} (must be one of: ${VECTOR_METRICS.join(", ")})`);
    }
    return value as VectorMetric;
  };

  const config: AppConfig = {
    embedding: {
      model: str("EMBEDDING_MODEL"),
      dimension: positiveInt("EMBEDDING_DIMENSION"),
      batchSize: positiveInt("EMBEDDING_BATCH_SIZE"),
    },
    index: {
      indexName: str("VECTOR_INDEX_NAME"),
      metric: metric("VECTOR_INDEX_METRIC"),
    },
    couchbase: {
      connectionString: str("COUCHBASE_CONNECTION_STRING"),
      username: str("COUCHBASE_USERNAME"),
      password: str("COUCHBASE_PASSWORD"),
      bucketName: str("COUCHBASE_BUCKET_NAME"),
      scopeName: str("COUCHBASE_SCOPE_NAME"),
      collectionName: str("COUCHBASE_COLLECTION_NAME"),
    },
  };

  if (problems.length > 0) {
    throw new Error(
      `Missing or invalid environment variables: ${problems.join(", ")}. Please check your .env file.`
    );
  }
  return config;
}

let cachedConfig: AppConfig | null = null;

/** Lazily load and cache the configuration from `process.env`. */
export function getConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
}
