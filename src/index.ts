import express from "express";
import authRoutes from "./routes/auth.route";
import messageRoutes from "./routes/message.route";
import dotenv from "dotenv";
import connectDB from "./lib/db";
import cors from "cors";
import cookieParser from "cookie-parser";
import { app, server } from "./lib/socket";

dotenv.config();

const PORT = process.env.PORT || 8080;

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "https://real-time-chat-frontend-lemon.vercel.app", // frontend URL
    credentials: true,
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Root route for testing
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed!", error);
  });
