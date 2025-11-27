import { body, param, ValidationChain } from "express-validator";

export interface ValidationError {
  field?: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
}

function validatePoint(point: any): boolean {
  if (typeof point !== "object" || point === null) return false;
  if (typeof point.x !== "number" || point.x < 0 || point.x > 1) return false;
  if (typeof point.y !== "number" || point.y < 0 || point.y > 1) return false;
  if (
    point.pressure !== undefined &&
    (typeof point.pressure !== "number" ||
      point.pressure < 0 ||
      point.pressure > 1)
  )
    return false;
  if (typeof point.t !== "number" || point.t <= 0) return false;
  return true;
}

function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function isHexColor(str: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(str);
}

function validateStroke(stroke: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!stroke || typeof stroke !== "object") {
    return {
      isValid: false,
      errors: [{ message: "Stroke must be an object" }],
    };
  }

  if (!stroke.strokeId || !isUUID(stroke.strokeId)) {
    errors.push({ field: "strokeId", message: "Invalid UUID format" });
  }

  if (
    !stroke.roomId ||
    typeof stroke.roomId !== "string" ||
    stroke.roomId.length === 0
  ) {
    errors.push({ field: "roomId", message: "Room ID is required" });
  }

  if (
    !stroke.userId ||
    typeof stroke.userId !== "string" ||
    stroke.userId.length === 0
  ) {
    errors.push({ field: "userId", message: "User ID is required" });
  }

  if (!stroke.color || !isHexColor(stroke.color)) {
    errors.push({ field: "color", message: "Invalid hex color format" });
  }

  if (
    typeof stroke.width !== "number" ||
    stroke.width < 1 ||
    stroke.width > 50
  ) {
    errors.push({ field: "width", message: "Width must be between 1 and 50" });
  }

  if (
    !Array.isArray(stroke.points) ||
    stroke.points.length < 1 ||
    stroke.points.length > 1000
  ) {
    errors.push({
      field: "points",
      message: "Points must be an array with 1-1000 items",
    });
  } else {
    const invalidPoints = stroke.points.filter((p: any) => !validatePoint(p));
    if (invalidPoints.length > 0) {
      errors.push({ field: "points", message: "Invalid point data" });
    }
  }

  if (typeof stroke.startTime !== "number" || stroke.startTime <= 0) {
    errors.push({
      field: "startTime",
      message: "Start time must be a positive number",
    });
  }

  if (
    stroke.endTime !== undefined &&
    (typeof stroke.endTime !== "number" || stroke.endTime <= 0)
  ) {
    errors.push({
      field: "endTime",
      message: "End time must be a positive number",
    });
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateFetchStrokes(
  params: any,
  _query: any
): ValidationResult {
  const errors: ValidationError[] = [];

  if (
    !params.roomId ||
    typeof params.roomId !== "string" ||
    params.roomId.length === 0
  ) {
    errors.push({ field: "roomId", message: "Room ID is required" });
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateSaveStroke(params: any, body: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (
    !params.roomId ||
    typeof params.roomId !== "string" ||
    params.roomId.length === 0
  ) {
    errors.push({ field: "roomId", message: "Room ID is required" });
  }

  if (!body.stroke) {
    return {
      isValid: false,
      errors: [{ field: "stroke", message: "Stroke is required" }],
    };
  }

  const strokeValidation = validateStroke(body.stroke);
  if (!strokeValidation.isValid) {
    return strokeValidation;
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateBatchSaveStrokes(
  params: any,
  body: any
): ValidationResult {
  const errors: ValidationError[] = [];

  if (
    !params.roomId ||
    typeof params.roomId !== "string" ||
    params.roomId.length === 0
  ) {
    errors.push({ field: "roomId", message: "Room ID is required" });
  }

  if (!Array.isArray(body.strokes)) {
    return {
      isValid: false,
      errors: [{ field: "strokes", message: "Strokes must be an array" }],
    };
  }

  if (body.strokes.length > 100) {
    errors.push({ field: "strokes", message: "Maximum 100 strokes per batch" });
  }

  for (let i = 0; i < body.strokes.length; i++) {
    const strokeValidation = validateStroke(body.strokes[i]);
    if (!strokeValidation.isValid) {
      errors.push({ field: `strokes[${i}]`, message: "Invalid stroke data" });
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateDeleteStrokes(params: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (
    !params.roomId ||
    typeof params.roomId !== "string" ||
    params.roomId.length === 0
  ) {
    errors.push({ field: "roomId", message: "Room ID is required" });
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateStrokeStart(payload: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!payload.roomId || typeof payload.roomId !== "string")
    errors.push({ field: "roomId", message: "Room ID required" });
  if (!payload.strokeId || !isUUID(payload.strokeId))
    errors.push({ field: "strokeId", message: "Valid UUID required" });
  if (!payload.userId || typeof payload.userId !== "string")
    errors.push({ field: "userId", message: "User ID required" });
  if (!payload.color || !isHexColor(payload.color))
    errors.push({ field: "color", message: "Valid hex color required" });
  if (
    typeof payload.width !== "number" ||
    payload.width < 1 ||
    payload.width > 50
  )
    errors.push({ field: "width", message: "Width 1-50 required" });

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateStrokePoints(payload: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!payload.roomId || typeof payload.roomId !== "string")
    errors.push({ field: "roomId", message: "Room ID required" });
  if (!payload.strokeId || !isUUID(payload.strokeId))
    errors.push({ field: "strokeId", message: "Valid UUID required" });
  if (
    !Array.isArray(payload.points) ||
    payload.points.length < 1 ||
    payload.points.length > 100
  ) {
    errors.push({ field: "points", message: "Points array 1-100 required" });
  } else if (payload.points.some((p: any) => !validatePoint(p))) {
    errors.push({ field: "points", message: "Invalid point data" });
  }
  if (
    typeof payload.sequence !== "number" ||
    payload.sequence < 0 ||
    !Number.isInteger(payload.sequence)
  ) {
    errors.push({
      field: "sequence",
      message: "Valid sequence number required",
    });
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateStrokeEnd(payload: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!payload.roomId || typeof payload.roomId !== "string")
    errors.push({ field: "roomId", message: "Room ID required" });
  if (!payload.strokeId || !isUUID(payload.strokeId))
    errors.push({ field: "strokeId", message: "Valid UUID required" });
  if (!payload.userId || typeof payload.userId !== "string")
    errors.push({ field: "userId", message: "User ID required" });
  if (typeof payload.timestamp !== "number" || payload.timestamp <= 0)
    errors.push({ field: "timestamp", message: "Valid timestamp required" });

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateCanvasClear(payload: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!payload.roomId || typeof payload.roomId !== "string")
    errors.push({ field: "roomId", message: "Room ID required" });
  if (!payload.userId || typeof payload.userId !== "string")
    errors.push({ field: "userId", message: "User ID required" });
  if (typeof payload.confirmed !== "boolean")
    errors.push({ field: "confirmed", message: "Confirmed boolean required" });

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateSyncRequest(payload: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!payload.roomId || typeof payload.roomId !== "string")
    errors.push({ field: "roomId", message: "Room ID required" });
  if (!payload.userId || typeof payload.userId !== "string")
    errors.push({ field: "userId", message: "User ID required" });
  if (
    payload.since !== undefined &&
    (typeof payload.since !== "number" || payload.since <= 0)
  ) {
    errors.push({ field: "since", message: "Valid timestamp required" });
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateStrokeUndo(payload: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!payload.roomId || typeof payload.roomId !== "string")
    errors.push({ field: "roomId", message: "Room ID required" });
  if (!payload.userId || typeof payload.userId !== "string")
    errors.push({ field: "userId", message: "User ID required" });
  if (!payload.strokeId || !isUUID(payload.strokeId))
    errors.push({ field: "strokeId", message: "Valid UUID required" });

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export const fetchStrokesValidation: ValidationChain[] = [
  param("roomId").trim().notEmpty().withMessage("Room ID is required"),
];

export const saveStrokeValidation: ValidationChain[] = [
  param("roomId").trim().notEmpty().withMessage("Room ID is required"),
  body("stroke").exists().withMessage("Stroke is required"),
  body("stroke.strokeId")
    .isUUID()
    .withMessage("Invalid UUID format for strokeId"),
  body("stroke.userId")
    .isString()
    .notEmpty()
    .withMessage("User ID is required"),
  body("stroke.color")
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage("Invalid hex color format"),
  body("stroke.width")
    .isInt({ min: 1, max: 50 })
    .withMessage("Width must be between 1 and 50"),
  body("stroke.points")
    .isArray({ min: 1, max: 1000 })
    .withMessage("Points must be an array with 1-1000 items"),
  body("stroke.points.*.x")
    .isFloat({ min: 0, max: 1 })
    .withMessage("Point x must be between 0 and 1"),
  body("stroke.points.*.y")
    .isFloat({ min: 0, max: 1 })
    .withMessage("Point y must be between 0 and 1"),
  body("stroke.points.*.t")
    .isFloat({ gt: 0 })
    .withMessage("Point t must be a positive number"),
  body("stroke.startTime")
    .isFloat({ gt: 0 })
    .withMessage("Start time must be a positive number"),
  body("stroke.endTime")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("End time must be a positive number"),
];

export const batchSaveStrokesValidation: ValidationChain[] = [
  param("roomId").trim().notEmpty().withMessage("Room ID is required"),
  body("strokes")
    .isArray({ min: 1, max: 100 })
    .withMessage("Strokes must be an array with max 100 items"),
  body("strokes.*.strokeId")
    .isUUID()
    .withMessage("Invalid UUID format for strokeId"),
  body("strokes.*.userId")
    .isString()
    .notEmpty()
    .withMessage("User ID is required"),
  body("strokes.*.color")
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage("Invalid hex color format"),
  body("strokes.*.width")
    .isInt({ min: 1, max: 50 })
    .withMessage("Width must be between 1 and 50"),
  body("strokes.*.points")
    .isArray({ min: 1 })
    .withMessage("Points must be an array with at least 1 item"),
];

export const deleteStrokesValidation: ValidationChain[] = [
  param("roomId").trim().notEmpty().withMessage("Room ID is required"),
];
