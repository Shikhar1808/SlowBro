import connectDB from "../db/connectDB.js";

export const connectDbMiddleware = async (req, res, next) => {
    try {
        req.db = await connectDB();

        const connection = await req.db.getConnection();
        console.log("Connection established:", connection.threadId);
        connection.release();

        next();
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}