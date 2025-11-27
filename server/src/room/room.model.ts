import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRoom extends Document {
  code: string;
  name: string;
  password?: string;
  createdBy: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  connectedUsers: mongoose.Types.ObjectId[];
  maxParticipants: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoomModel extends Model<IRoom> {
  isCodeTaken(code: string): Promise<boolean>;
}

const roomSchema = new Schema<IRoom>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 6,
      maxlength: 8,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    password: {
      type: String,
      select: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    connectedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxParticipants: {
      type: Number,
      default: 8,
      min: 2,
      max: 8,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ participants: 1 });
roomSchema.index({ connectedUsers: 1 });

roomSchema.statics.isCodeTaken = async function (
  code: string
): Promise<boolean> {
  const room = await this.findOne({ code: code.toUpperCase() });
  return !!room;
};

roomSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  return obj;
};

const Room = mongoose.model<IRoom, IRoomModel>("Room", roomSchema);

export default Room;
