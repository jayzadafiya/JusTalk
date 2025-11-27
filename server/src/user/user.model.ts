import { Schema, model, Document, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  firstName: string;
  birthdate: Date;
  email?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserModel extends Model<IUser> {
  isUsernameTaken(username: string): Promise<boolean>;
}

const userSchema = new Schema<IUser, IUserModel>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must be less than 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscores",
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name must be less than 50 characters"],
    },
    birthdate: {
      type: Date,
      required: [true, "Birthdate is required"],
      validate: {
        validator: function (value: Date) {
          const age =
            (new Date().getTime() - new Date(value).getTime()) /
            (1000 * 60 * 60 * 24 * 365);
          return age >= 13;
        },
        message: "You must be at least 13 years old to register",
      },
    },
    email: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      sparse: true,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number"],
    },
    avatar: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.statics.isUsernameTaken = async function (
  username: string
): Promise<boolean> {
  const user = await this.findOne({
    username: { $regex: new RegExp(`^${username}$`, "i") },
  });
  return !!user;
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = model<IUser, IUserModel>("User", userSchema);
export default User;
