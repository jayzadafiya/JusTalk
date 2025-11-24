import { Request, Response } from "express";
import userService from "./user.service";
import { asyncHandler } from "../utils/asyncHandler";
import { NotFoundError } from "../utils/errors";

export const signup = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, password, firstName, birthdate, email, phone } = req.body;

    const user = await userService.createUser({
      username,
      password,
      firstName,
      birthdate: new Date(birthdate),
      email,
      phone,
    });

    const token = userService.generateToken(user._id.toString(), user.username);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: user.toJSON(),
        token,
      },
    });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    const user = await userService.authenticateUser(username, password);
    const token = userService.generateToken(user._id.toString(), user.username);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toJSON(),
        token,
      },
    });
  }
);

export const checkUsername = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username } = req.body;
    const isTaken = await userService.isUsernameTaken(username);

    res.status(200).json({
      success: true,
      available: !isTaken,
      message: isTaken ? "Username is already taken" : "Username is available",
    });
  }
);

export const getProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).userId;

    const user = await userService.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.status(200).json({
      success: true,
      data: user.toJSON(),
    });
  }
);
