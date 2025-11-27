import { Router } from "express";
import * as userController from "@user/user.controller";
import * as userValidator from "@user/user.validator";
import { verifyToken } from "@middleware/auth.middleware";
import { validateRequest } from "@middleware/validation.middleware";

const router = Router();

/**
 * @route   POST /api/user/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/signup",
  userValidator.signupValidation,
  validateRequest,
  userController.signup
);

/**
 * @route   POST /api/user/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  "/login",
  userValidator.loginValidation,
  validateRequest,
  userController.login
);

/**
 * @route   POST /api/user/check-username
 * @desc    Check if username is available
 * @access  Public
 */
router.post(
  "/check-username",
  userValidator.checkUsernameValidation,
  validateRequest,
  userController.checkUsername
);

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get("/profile", verifyToken, userController.getProfile);

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/profile",
  verifyToken,
  userValidator.updateProfileValidation,
  validateRequest,
  userController.updateProfile
);

export default router;
