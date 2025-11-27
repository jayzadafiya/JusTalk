import { Response } from "express";
import { AuthRequest } from "@middleware/auth.middleware";
import roomService from "@room/room.service";
import { asyncHandler } from "@utils/asyncHandler";

export const createRoom = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, password, maxParticipants } = req.body;
    const userId = req.userId!;

    const room = await roomService.createRoom({
      name,
      password,
      createdBy: userId,
      maxParticipants,
    });

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: {
        room: {
          code: room.code,
          name: room.name,
          maxParticipants: room.maxParticipants,
          hasPassword: !!room.password,
        },
      },
    });
  }
);

export const joinRoom = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { code, password } = req.body;
    const userId = req.userId!;

    const room = await roomService.joinRoom(code, userId, password);

    res.status(200).json({
      success: true,
      message: "Joined room successfully",
      data: { room },
    });
  }
);

export const leaveRoom = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { code } = req.params;
    const userId = req.userId!;

    const room = await roomService.leaveRoom(code, userId);

    res.status(200).json({
      success: true,
      message: "Left room successfully",
      data: { room },
    });
  }
);

export const getRoomByCode = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { code } = req.params;

    const room = await roomService.getRoomByCode(code);

    res.status(200).json({
      success: true,
      data: { room },
    });
  }
);

export const getUserRooms = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await roomService.getUserRooms(userId, page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);
