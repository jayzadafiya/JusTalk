import { Socket } from "socket.io";
import {
  validateStrokeStart,
  validateStrokePoints,
  validateStrokeEnd,
  validateCanvasClear,
  validateSyncRequest,
  validateStrokeUndo,
} from "@doodle/doodle.validator.js";
import * as doodleService from "@doodle/doodle.service.js";
import { sanitizeColor, sanitizeWidth } from "@socket/doodle.utils.js";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 1000;
const MAX_EVENTS_PER_WINDOW = 100;

function checkRateLimit(socketId: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(socketId);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(socketId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (limit.count >= MAX_EVENTS_PER_WINDOW) {
    return false;
  }

  limit.count++;
  return true;
}

const strokeBuffer = new Map<
  string,
  {
    roomId: string;
    userId: string;
    color: string;
    width: number;
    points: any[];
    startTime: number;
    meta?: any;
  }
>();

export function handleStrokeStart(socket: Socket, _io: any) {
  return async (payload: any) => {
    try {
      if (!checkRateLimit(socket.id)) {
        console.warn(`Rate limit exceeded for socket ${socket.id}`);
        return;
      }

      const validation = validateStrokeStart(payload);
      if (!validation.isValid) {
        socket.emit("doodle:error", {
          message: "Invalid stroke start payload",
          errors: validation.errors,
        });
        return;
      }

      const sanitized = {
        ...payload,
        color: sanitizeColor(payload.color),
        width: sanitizeWidth(payload.width),
      };

      strokeBuffer.set(sanitized.strokeId, {
        roomId: sanitized.roomId,
        userId: sanitized.userId,
        color: sanitized.color,
        width: sanitized.width,
        points: [],
        startTime: Date.now(),
        meta: sanitized.meta,
      });

      socket.to(sanitized.roomId).emit("doodle:remote:stroke:start", sanitized);

      console.log(
        `Stroke started: ${sanitized.strokeId} in room ${sanitized.roomId}`
      );
    } catch (error) {
      console.error("Error handling stroke start:", error);
      socket.emit("doodle:error", {
        message: "Invalid stroke start payload",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}

export function handleStrokePoints(socket: Socket, _io: any) {
  return async (payload: any) => {
    try {
      if (!checkRateLimit(socket.id)) {
        console.warn(`Rate limit exceeded for socket ${socket.id}`);
        return;
      }

      const validation = validateStrokePoints(payload);
      if (!validation.isValid) {
        socket.emit("doodle:error", {
          message: "Invalid stroke points payload",
          errors: validation.errors,
        });
        return;
      }

      if (payload.points.length > 100) {
        socket.emit("doodle:error", {
          message: "Too many points in single emit (max 100)",
        });
        return;
      }

      const entry = strokeBuffer.get(payload.strokeId);
      if (entry) {
        entry.points.push(...payload.points);
      }

      socket.to(payload.roomId).emit("doodle:remote:stroke:points", payload);
    } catch (error) {
      console.error("Error handling stroke points:", error);
      socket.emit("doodle:error", {
        message: "Invalid stroke points payload",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}

export function handleStrokeEnd(socket: Socket, _io: any) {
  return async (payload: any) => {
    try {
      if (!checkRateLimit(socket.id)) {
        console.warn(`Rate limit exceeded for socket ${socket.id}`);
        return;
      }

      const validation = validateStrokeEnd(payload);
      if (!validation.isValid) {
        socket.emit("doodle:error", {
          message: "Invalid stroke end payload",
          errors: validation.errors,
        });
        return;
      }

      socket.to(payload.roomId).emit("doodle:remote:stroke:end", payload);

      const buf = strokeBuffer.get(payload.strokeId);

      const strokeToSave = {
        strokeId: payload.strokeId,
        roomId: payload.roomId,
        userId: payload.userId,
        color: buf?.color ?? "#000000",
        width: buf?.width ?? 3,
        points: buf?.points ?? [],
        startTime: buf?.startTime ?? Date.now(),
        endTime: payload.timestamp ?? Date.now(),
        meta: buf?.meta,
      };

      if (strokeToSave.points && strokeToSave.points.length > 0) {
        await doodleService.saveStroke(strokeToSave);
      }

      strokeBuffer.delete(payload.strokeId);
      console.log(
        `Stroke ended: ${payload.strokeId} in room ${payload.roomId}`
      );
    } catch (error) {
      console.error("Error handling stroke end:", error);
      socket.emit("doodle:error", {
        message: "Invalid stroke end payload",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}

export function handleCanvasClear(socket: Socket, io: any) {
  return async (payload: any) => {
    try {
      const validation = validateCanvasClear(payload);
      if (!validation.isValid) {
        socket.emit("doodle:error", {
          message: "Invalid canvas clear payload",
          errors: validation.errors,
        });
        return;
      }

      if (!payload.confirmed) {
        socket.emit("doodle:error", {
          message: "Canvas clear must be confirmed",
        });
        return;
      }

      io.to(payload.roomId).emit("doodle:remote:canvas:clear", payload);

      await doodleService.deleteRoomStrokes(payload.roomId);
      console.log(`Canvas cleared for room ${payload.roomId}`);
    } catch (error) {
      console.error("Error handling canvas clear:", error);
      socket.emit("doodle:error", {
        message: "Invalid canvas clear payload",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}

export function handleStrokeUndo(socket: Socket, io: any) {
  return async (payload: any) => {
    try {
      const validation = validateStrokeUndo(payload);
      if (!validation.isValid) {
        socket.emit("doodle:error", {
          message: "Invalid undo payload",
          errors: validation.errors,
        });
        return;
      }

      socket.to(payload.roomId).emit("doodle:remote:stroke:undo", payload);

      await doodleService.deleteStroke(payload.strokeId);

      console.log(
        `Stroke undone: ${payload.strokeId} in room ${payload.roomId} by user ${payload.userId}`
      );
    } catch (error) {
      console.error("Error handling stroke undo:", error);
      socket.emit("doodle:error", {
        message: "Failed to undo stroke",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}

export function handleSyncRequest(socket: Socket, _io: any) {
  return async (payload: any) => {
    try {
      const validation = validateSyncRequest(payload);
      if (!validation.isValid) {
        socket.emit("doodle:error", {
          message: "Invalid sync request payload",
          errors: validation.errors,
        });
        return;
      }

      const strokes = await doodleService.getStrokesByRoom(
        payload.roomId,
        200,
        payload.since
      );

      socket.emit("doodle:sync:response", {
        roomId: payload.roomId,
        strokes,
      });

      console.log(
        `Sync sent: ${strokes.length} strokes for room ${payload.roomId}`
      );
    } catch (error) {
      console.error("Error handling sync request:", error);
      socket.emit("doodle:error", {
        message: "Failed to sync strokes",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}

export function registerDoodleHandlers(socket: Socket, io: any) {
  socket.on("doodle:stroke:start", handleStrokeStart(socket, io));
  socket.on("doodle:stroke:points", handleStrokePoints(socket, io));
  socket.on("doodle:stroke:end", handleStrokeEnd(socket, io));
  socket.on("doodle:canvas:clear", handleCanvasClear(socket, io));
  socket.on("doodle:stroke:undo", handleStrokeUndo(socket, io));
  socket.on("doodle:sync:request", handleSyncRequest(socket, io));
}

export function handleDoodleDisconnect(socketId: string) {
  rateLimitMap.delete(socketId);
}

export function getBufferedStrokes(roomId: string) {
  const strokes: any[] = [];
  for (const [strokeId, entry] of strokeBuffer.entries()) {
    if (entry.roomId === roomId) {
      strokes.push({
        strokeId,
        roomId: entry.roomId,
        userId: entry.userId,
        color: entry.color,
        width: entry.width,
        points: entry.points,
        startTime: entry.startTime,
        endTime: undefined,
        meta: entry.meta,
      });
    }
  }

  strokes.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
  return strokes;
}
