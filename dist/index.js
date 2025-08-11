import express from "express";
import authRoutes from "./routes/auth.route";
const app = express();
const PORT = 8080;
app.use("/api/auth", authRoutes);
app.listen(PORT, () => {
    console.log("Server is runnig ", PORT);
});
