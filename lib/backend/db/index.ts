import mongoose from "mongoose";

type MongooseCache = {
    connection: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

declare global {
    var mongooseCache: MongooseCache | undefined;
}

const cached = globalThis.mongooseCache ?? { connection: null, promise: null };
globalThis.mongooseCache = cached;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return mongoose;
    if (cached.connection) return cached.connection;

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not configured");

    if (!cached.promise) {
        cached.promise = mongoose.connect(uri).then((connection) => {
            cached.connection = connection;
            console.log(`MongoDB connected: ${connection.connection.host} (Database: ${connection.connection.name})`);
            return connection;
        }).catch((error) => {
            cached.promise = null;
            throw error;
        });
    }

    return cached.promise;
}

export { connectDB }