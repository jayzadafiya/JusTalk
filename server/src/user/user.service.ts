import { config } from "@config/env.js";
import User from "./user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
} from "../utils/errors";

export class UserService {
  async createUser(userData: {
    username: string;
    password: string;
    firstName: string;
    birthdate: Date;
    email?: string;
    phone?: string;
  }) {
    const usernameTaken = await User.isUsernameTaken(userData.username);
    if (usernameTaken) {
      throw new ConflictError("Username already exists", "username");
    }

    if (userData.email) {
      const existingEmail = await User.findOne({ email: userData.email });
      if (existingEmail) {
        throw new ConflictError("Email already registered", "email");
      }
    }

    if (userData.phone) {
      const existingPhone = await User.findOne({ phone: userData.phone });
      if (existingPhone) {
        throw new ConflictError("Phone number already registered", "phone");
      }
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = new User({
      ...userData,
      password: hashedPassword,
    });

    await user.save();
    return user;
  }

  async authenticateUser(username: string, password: string) {
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid username or password");
    }

    if (!user.isActive) {
      throw new ForbiddenError("Account is deactivated");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid username or password");
    }

    user.lastLogin = new Date();
    await user.save();

    return user;
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    return await User.isUsernameTaken(username);
  }

  async findById(userId: string) {
    return await User.findById(userId);
  }

  generateToken(userId: string, username: string): string {
    return jwt.sign({ userId, username }, config.jwtSecret, {
      expiresIn: "7d",
    });
  }
}

export default new UserService();
