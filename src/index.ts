import express from "express";
import authRoutes from "./routes/auth.route";
import dotenv from "dotenv";
import connectDB from "./lib/db";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
app.use(cookieParser());
app.use(express.json());
const PORT = process.env.PORT! || 8080;
// console.log(PORT);

app.use("/api/auth", authRoutes);
app.use("/api/auth/login", authRoutes);
app.use("/api/auth/logout", authRoutes);



connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("mongoDB  connection failed !!!", error);
  });
