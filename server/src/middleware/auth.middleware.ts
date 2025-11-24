import { config } from "@config/env.js";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "No token provided. Please login to continue.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as {
        userId: string;
        username: string;
      };
      req.userId = decoded.userId;
      req.username = decoded.username;
      next();
    } catch (jwtError: any) {
      if (jwtError.name === "TokenExpiredError") {
        res.status(401).json({
          success: false,
          message: "Token has expired. Please login again.",
          code: "TOKEN_EXPIRED",
        });
        return;
      }

      if (jwtError.name === "JsonWebTokenError") {
        res.status(401).json({
          success: false,
          message: "Invalid token. Please login again.",
          code: "INVALID_TOKEN",
        });
        return;
      }

      throw jwtError;
    }
  } catch (error: any) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export const verifySocketToken = async (
  token: string
): Promise<{ userId: string; username: string }> => {
  const decoded = jwt.verify(token, config.jwtSecret) as {
    userId: string;
    username: string;
  };
  return decoded;
};
