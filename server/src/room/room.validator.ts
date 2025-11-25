import { body } from "express-validator";

export const createRoomValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Room name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Room name must be between 2 and 100 characters"),

  body("password")
    .optional()
    .isLength({ min: 4, max: 20 })
    .withMessage("Password must be between 4 and 20 characters"),

  body("maxParticipants")
    .optional()
    .isInt({ min: 2, max: 8 })
    .withMessage("Max participants must be between 2 and 8"),
];

export const joinRoomValidation = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Room code is required")
    .isLength({ min: 6, max: 8 })
    .withMessage("Invalid room code"),

  body("password")
    .optional()
    .isString()
    .withMessage("Password must be a string"),
];

export const getRoomValidation = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Room code is required")
    .isLength({ min: 6, max: 8 })
    .withMessage("Invalid room code"),
];
