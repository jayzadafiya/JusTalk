import mongoose, { Schema, Document } from "mongoose";

interface IPoint {
  x: number;
  y: number;
  pressure?: number;
  t: number;
}

export interface IDoodleStroke extends Document {
  strokeId: string;
  roomId: string;
  userId: mongoose.Types.ObjectId;
  color: string;
  width: number;
  points: IPoint[];
  startTime: number;
  endTime?: number;
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PointSchema = new Schema<IPoint>(
  {
    x: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    y: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    pressure: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5,
    },
    t: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const DoodleStrokeSchema = new Schema<IDoodleStroke>(
  {
    strokeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    color: {
      type: String,
      required: true,
      match: /^#[0-9A-F]{6}$/i,
    },
    width: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    points: {
      type: [PointSchema],
      required: true,
      validate: {
        validator: function (points: IPoint[]) {
          return points.length > 0 && points.length <= 1000;
        },
        message: "Points array must have 1-1000 points",
      },
    },
    startTime: {
      type: Number,
      required: true,
    },
    endTime: {
      type: Number,
    },
    meta: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

DoodleStrokeSchema.index({ roomId: 1, createdAt: -1 });
DoodleStrokeSchema.index({ roomId: 1, startTime: -1 });

DoodleStrokeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

DoodleStrokeSchema.statics.findByRoom = function (
  roomId: string,
  limit: number = 200,
  since?: number
) {
  const query: any = { roomId };
  if (since) {
    query.startTime = { $gt: since };
  }
  return this.find(query).sort({ startTime: 1 }).limit(limit).select("-__v");
};

DoodleStrokeSchema.statics.deleteByRoom = function (roomId: string) {
  return this.deleteMany({ roomId });
};

DoodleStrokeSchema.statics.bulkUpsert = async function (strokes: any[]) {
  const operations = strokes.map((stroke) => ({
    updateOne: {
      filter: { strokeId: stroke.strokeId },
      update: { $setOnInsert: stroke },
      upsert: true,
    },
  }));

  return this.bulkWrite(operations);
};

DoodleStrokeSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  return obj;
};

const DoodleStroke = mongoose.model<IDoodleStroke>(
  "DoodleStroke",
  DoodleStrokeSchema
);

export default DoodleStroke;
