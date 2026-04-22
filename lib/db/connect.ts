import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "CRITICAL ERROR: Please define the MONGODB_URI environment variable inside your .env or .env.local file.\n" +
      "The application cannot start without a valid MongoDB connection string.",
  );
}

/**
 * Interface to define the cached mongoose connection.
 * We store both the connection and the promise resolving to the connection.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the NodeJS global scope so TypeScript recognizes our custom property
declare global {
  var mongooseCache: MongooseCache;
}

// Initialize the cache object in the Node.js global scope if it doesn't already exist.
let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

/**
 * Connects to the MongoDB database using Mongoose.
 *
 * Why this caching logic is strictly necessary for Next.js App Router (especially Server Actions & API Routes):
 * Next.js uses a custom hot-reloading feature in development. Every time you save a file, Next.js clears
 * the module cache. If we simply called `mongoose.connect()` every time a component or route handler
 * ran, Next.js would spawn a new connection on every file save.
 *
 * MongoDB Atlas standard tiers have a connection limit (e.g., M0 clusters limit you to 500 max connections).
 * Creating a new connection rapidly without reusing them will quickly exhaust the pool, crashing the
 * application with an `ECONNREFUSED` or `MongoError: connection pool exhausted` error.
 *
 * By attaching the Promise and connection object to Node's `global` object, we are storing the connection State
 * outside of the Next.js module cache scope. When a hot-reload occurs, `global` is preserved, allowing
 * subsequent requests to immediately reuse the already-established `cached.conn` instead of dialing the Database again.
 *
 * @returns {Promise<typeof mongoose>} A promise resolving to the connected Mongoose instance.
 */
export async function connectDB(): Promise<typeof mongoose> {
  // If we already have an established connection, return it immediately.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is not already in progress, start one.
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering so failures throw immediately instead of hanging
    };

    // Store the connection promise in the global cache so subsequent calls can await the same connection attempt.
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  try {
    // Await the connection and assign it to our cache once completely resolved
    cached.conn = await cached.promise;
  } catch (e) {
    // If the connection attempt fails, clear the promise so the next caller doesn't await a permanently failed promise
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
