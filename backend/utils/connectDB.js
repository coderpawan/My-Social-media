const mongoose = require("mongoose");

// Cache the connection to reuse across serverless function invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If already connected, return the existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is in progress, wait for it
  if (!cached.promise) {
    const mongodbUri = process.env.MONGO_URI;

    if (!mongodbUri) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false, // Disable buffering - fail fast if not connected
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(mongodbUri, opts).then((mongoose) => {
      console.log("Mongoose Connected");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
