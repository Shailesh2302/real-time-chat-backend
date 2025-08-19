import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

interface JwtPayloadWithId extends jwt.JwtPayload {
  _id: string | number;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any; // or use a proper User type
    }
  }
}

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as
      | JwtPayloadWithId
      | string;

    // console.log("step-1");

    // console.log(decodedToken);
    if (
      !decodedToken ||
      typeof decodedToken === "string" ||
      !("_id" in decodedToken)
    ) {
        res.status(401).json({ message: "Unauthorized - Invalid Token" });
      return;
    }

    // console.log("step - 2");
    const user = await User.findById(decodedToken._id).select("-password");

    if (!user) {
      res.status(401).json({
        message: "Unauthorized - User not found",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
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
};
