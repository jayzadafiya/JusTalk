import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error(
    "FATAL ERROR: JWT_SECRET is not defined in environment variables"
  );
}

if (!process.env.MONGODB_URI) {
  throw new Error(
    "FATAL ERROR: MONGODB_URI is not defined in environment variables"
  );
}

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  isDevelopment: (process.env.NODE_ENV || "development") === "development",
  isProduction: process.env.NODE_ENV === "production",
};
