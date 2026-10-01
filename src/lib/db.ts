import mongoose from "mongoose";

const mongo = process.env.MONGO_URI;

if (!mongo) {
    throw new Error("Please provide MONGO_URI in the environment variables");
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(mongo, { bufferCommands: false });
    }
    cached.conn = await cached.promise;
    return cached.conn;
};
