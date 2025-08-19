import express from "express";
import authRoutes from "./routes/auth.route";
import path from "path";
import messageRoutes from "./routes/message.route";
import dotenv from "dotenv";
import connectDB from "./lib/db";
import cors from "cors";
import cookieParser from "cookie-parser";
import { app, server } from "./lib/socket";

dotenv.config();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
const __dirname = path.resolve();
app.use(
  cors({
    origin: "https://real-time-chat-frontend-lemon.vercel.app",
    credentials: true,
  })
);
// app.use(express.json());
const PORT = process.env.PORT! || 8080;
// console.log(PORT);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`\n Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("mongoDB  connection failed !!!", error);
  });
