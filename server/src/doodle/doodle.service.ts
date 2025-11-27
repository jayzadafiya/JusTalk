import DoodleStroke, { IDoodleStroke } from "@doodle/doodle.model";
import { NotFoundError, ValidationError } from "@utils/errors";

export const getStrokesByRoom = async (
  roomId: string,
  limit: number = 200,
  since?: number
): Promise<IDoodleStroke[]> => {
  if (!roomId) {
    throw new ValidationError("Room ID is required");
  }

  const strokes = await (DoodleStroke as any).findByRoom(roomId, limit, since);
  return strokes;
};

export const saveStroke = async (strokeData: any): Promise<IDoodleStroke> => {
  if (!strokeData.strokeId) {
    throw new ValidationError("Stroke ID is required");
  }

  if (!strokeData.roomId) {
    throw new ValidationError("Room ID is required");
  }

  const existing = await DoodleStroke.findOne({
    strokeId: strokeData.strokeId,
  });
  if (existing) {
    return existing;
  }

  const stroke = new DoodleStroke(strokeData);
  await stroke.save();
  return stroke;
};

export const batchSaveStrokes = async (strokes: any[]): Promise<void> => {
  if (!strokes || strokes.length === 0) {
    throw new ValidationError("No strokes provided");
  }

  await (DoodleStroke as any).bulkUpsert(strokes);
};

export const deleteRoomStrokes = async (roomId: string): Promise<void> => {
  if (!roomId) {
    throw new ValidationError("Room ID is required");
  }

  await (DoodleStroke as any).deleteByRoom(roomId);
};

export const deleteStroke = async (strokeId: string): Promise<void> => {
  if (!strokeId) {
    throw new ValidationError("Stroke ID is required");
  }

  const result = await DoodleStroke.deleteOne({ strokeId });

  if (result.deletedCount === 0) {
    throw new NotFoundError("Stroke not found");
  }
};

export const countRoomStrokes = async (roomId: string): Promise<number> => {
  if (!roomId) {
    throw new ValidationError("Room ID is required");
  }

  return await DoodleStroke.countDocuments({ roomId });
};
