/**
 * 📄 What this file does:
 * 🔌 Connects the Next.js app to the MongoDB database.
 * 🧠 Caches the connection so saving files in dev mode doesn't crash the database!
 * 🛡️ Makes sure the database URL is provided before starting.
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "🚨 CRITICAL ERROR: MONGODB_URI is missing in .env file! \n" +
      "The app needs this to talk to the database.",
  );
}

/**
 * 📦 Keep connection and promise safe in cache
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// 🌍 Tell TypeScript about our global cache type
declare global {
  var mongooseCache: MongooseCache;
}

// 🛑 Set up cache if it doesn't exist yet
let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

/**
 * 🚀 Connect to MongoDB database
 *
 * 🧠 We use global cache because Next.js reloads on every save in dev mode.
 * Without cache, we would make too many connections and crash the database!
 *
 * @returns {Promise<typeof mongoose>} The database connection
 */
export async function connectDB(): Promise<typeof mongoose> {
  // 🟢 Return right away if we are already connected!
  if (cached.conn) {
    return cached.conn;
  }

  // 🎬 Start a new connection if one isn't running
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // ⚡ Throw errors instantly instead of waiting
    };

    // 💾 Save the promise so other things can wait on this same connection
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  try {
    // ✅ Wait for it, then lock it into our cache
    cached.conn = await cached.promise;
  } catch (e) {
    // ❌ If it fails, clear the promise so we can try again next time
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
