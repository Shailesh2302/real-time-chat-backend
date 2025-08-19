var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from "jsonwebtoken";
import User from "../models/user.model";
export const protectRoute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.status(401).json({
                message: "Unauthorized - No Token Provided",
            });
            return;
        }
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined");
            res.status(500).json({
                message: "Internal Server Error",
            });
            return;
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("step-1");
        // console.log(decodedToken);
        if (!decodedToken ||
            typeof decodedToken === "string" ||
            !("_id" in decodedToken)) {
            res.status(401).json({ message: "Unauthorized - Invalid Token" });
            return;
        }
        // console.log("step - 2");
        const user = yield User.findById(decodedToken._id).select("-password");
        if (!user) {
            res.status(401).json({
                message: "Unauthorized - User not found",
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.log("Error in protectRoute middleware: ", error.message);
        console.log("step - 3 ");
        // Handle specific JWT errors
        if (error.name === "TokenExpiredError") {
            res.status(401).json({
                message: "Unauthorized - Token Expired",
            });
            return;
        }
        if (error.name === "JsonWebTokenError") {
            res.status(401).json({
                message: "Unauthorized - Invalid Token",
            });
            return;
        }
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
});
