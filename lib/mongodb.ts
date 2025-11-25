import mongoose, { Mongoose, ConnectOptions } from 'mongoose';

// Connection string must be provided via environment variable for security.
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

// Shape of the cached connection stored on the global object.
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Use globalThis to share the cached connection across HMR reloads in development.
const globalForMongoose = globalThis as typeof globalThis & {
  _mongooseCache?: MongooseCache;
};

if (!globalForMongoose._mongooseCache) {
  globalForMongoose._mongooseCache = { conn: null, promise: null };
}

const cached = globalForMongoose._mongooseCache;

// Optional: configure global Mongoose settings here.
mongoose.set('strictQuery', true);

/**
 * Establishes (or reuses) a Mongoose connection.
 * The connection is cached on the global object to avoid creating
 * multiple connections during development with hot reload.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // If an active connection already exists, reuse it.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is in-flight, reuse the existing promise.
  if (!cached.promise) {
    const options: ConnectOptions = {
      // Let Mongoose manage its internal connection pool.
      bufferCommands: false,
      dbName: process.env.MONGODB_DB_NAME,
    };

    cached.promise = mongoose.connect(MONGODB_URI, options);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset promise so future calls can retry if the initial connection fails.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
