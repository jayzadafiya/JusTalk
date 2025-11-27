/**
 * Doodle Routes
 * REST API endpoints for drawing strokes
 */

import { Router } from "express";
import * as doodleController from "./doodle.controller";
import * as doodleValidator from "./doodle.validator";
import { verifyToken } from "@middleware/auth.middleware";
import { validateRequest } from "@middleware/validation.middleware";

const router = Router();

/**
 * @route   GET /api/doodle/:roomId/strokes
 * @desc    Fetch strokes for a room
 * @access  Private
 */
router.get(
  "/:roomId/strokes",
  verifyToken,
  doodleValidator.fetchStrokesValidation,
  validateRequest,
  doodleController.getStrokes
);

/**
 * @route   POST /api/doodle/:roomId/strokes
 * @desc    Save a new stroke
 * @access  Private
 */
router.post(
  "/:roomId/strokes",
  verifyToken,
  doodleValidator.saveStrokeValidation,
  validateRequest,
  doodleController.createStroke
);

/**
 * @route   POST /api/doodle/:roomId/strokes/batch
 * @desc    Batch save multiple strokes
 * @access  Private
 */
router.post(
  "/:roomId/strokes/batch",
  verifyToken,
  doodleValidator.batchSaveStrokesValidation,
  validateRequest,
  doodleController.batchCreateStrokes
);

/**
 * @route   DELETE /api/doodle/:roomId/strokes
 * @desc    Clear all strokes for a room
 * @access  Private
 */
router.delete(
  "/:roomId/strokes",
  verifyToken,
  doodleValidator.deleteStrokesValidation,
  validateRequest,
  doodleController.clearStrokes
);

/**
 * @route   GET /api/doodle/:roomId/stats
 * @desc    Get statistics for a room's strokes
 * @access  Private
 */
router.get("/:roomId/stats", verifyToken, doodleController.getStats);

export default router;
