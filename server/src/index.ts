import { config } from "@config/env.js";
import express, { Application, Request, Response } from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { connectDatabase } from "@config/database.js";
import userRoutes from "./user/user.route.js";
import roomRoutes from "./room/room.route.js";
import doodleRoutes from "@doodle/doodle.route.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { initializeSocketServer } from "./socket/socketServer.js";

const app: Application = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDatabase();

// API Routes
app.use("/api/user", userRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/doodle", doodleRoutes);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "JusTalk API is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

app.use(errorHandler);

// Initialize Socket.IO server
initializeSocketServer(io);

httpServer.listen(config.port, () => {
  console.log(`🚀 JusTalk API server running on port ${config.port}`);
  console.log(`📡 Socket.IO enabled`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API: http://localhost:${config.port}/api`);
});

export { io };
