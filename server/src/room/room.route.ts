import { Router } from "express";
import * as roomController from "@room/room.controller";
import * as roomValidator from "@room/room.validator";
import { verifyToken } from "@middleware/auth.middleware";
import { validateRequest } from "@middleware/validation.middleware";

const router = Router();

/**
 * @route   POST /api/room/create
 * @desc    Create a new video call room
 * @access  Private
 */
router.post(
  "/create",
  verifyToken,
  roomValidator.createRoomValidation,
  validateRequest,
  roomController.createRoom
);

/**
 * @route   POST /api/room/join
 * @desc    Join an existing room
 * @access  Private
 */
router.post(
  "/join",
  verifyToken,
  roomValidator.joinRoomValidation,
  validateRequest,
  roomController.joinRoom
);

/**
 * @route   POST /api/room/leave/:code
 * @desc    Leave a room
 * @access  Private
 */
router.post("/leave/:code", verifyToken, roomController.leaveRoom);

/**
 * @route   GET /api/room/:code
 * @desc    Get room details by code
 * @access  Private
 */
router.get("/:code", verifyToken, roomController.getRoomByCode);

/**
 * @route   GET /api/room
 * @desc    Get all rooms where user has participated
 * @access  Private
 */
router.get("/", verifyToken, roomController.getUserRooms);

export default router;
