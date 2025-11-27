import { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import * as doodleService from "@doodle/doodle.service";

export const getStrokes = asyncHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const limit = parseInt(req.query.limit as string) || 200;
  const since = req.query.since
    ? parseInt(req.query.since as string)
    : undefined;

  const strokes = await doodleService.getStrokesByRoom(roomId, limit, since);

  res.json({
    success: true,
    data: {
      strokes,
      total: strokes.length,
    },
  });
});

export const createStroke = asyncHandler(
  async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { stroke } = req.body;

    if (stroke.roomId !== roomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID mismatch",
      });
    }

    const savedStroke = await doodleService.saveStroke(stroke);

    res.status(201).json({
      success: true,
      data: {
        stroke: savedStroke,
      },
      message: "Stroke saved successfully",
    });
  }
);

export const batchCreateStrokes = asyncHandler(
  async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { strokes } = req.body;

    const invalidStrokes = strokes.filter((s: any) => s.roomId !== roomId);
    if (invalidStrokes.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some strokes have mismatched room IDs",
      });
    }

    await doodleService.batchSaveStrokes(strokes);

    res.status(201).json({
      success: true,
      message: `${strokes.length} strokes saved successfully`,
    });
  }
);

export const clearStrokes = asyncHandler(
  async (req: Request, res: Response) => {
    const { roomId } = req.params;

    await doodleService.deleteRoomStrokes(roomId);

    res.json({
      success: true,
      message: "All strokes cleared successfully",
    });
  }
);

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;

  const count = await doodleService.countRoomStrokes(roomId);

  res.json({
    success: true,
    data: {
      roomId,
      strokeCount: count,
    },
  });
});
