import axiosInstance from "@lib/axios";
import type { Stroke, FetchStrokesResponse, SaveStrokeResponse } from "@types";

export const fetchStrokes = async (
  roomId: string,
  limit: number = 200
): Promise<Stroke[]> => {
  try {
    const response = await axiosInstance.get<FetchStrokesResponse>(
      `/api/doodle/${roomId}/strokes`,
      {
        params: { limit },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data.strokes;
    }

    return [];
  } catch (error) {
    console.error("Error fetching strokes:", error);
    return [];
  }
};

export const saveStroke = async (
  roomId: string,
  stroke: Stroke
): Promise<Stroke | null> => {
  try {
    const response = await axiosInstance.post<SaveStrokeResponse>(
      `/api/doodle/${roomId}/strokes`,
      { stroke }
    );

    if (response.data.success && response.data.data) {
      return response.data.data.stroke;
    }

    return null;
  } catch (error) {
    console.error("Error saving stroke:", error);
    return null;
  }
};

export const clearRoomStrokes = async (roomId: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.delete(
      `/api/doodle/${roomId}/strokes`
    );
    return response.data.success;
  } catch (error) {
    console.error("Error clearing strokes:", error);
    return false;
  }
};

export const batchSaveStrokes = async (
  roomId: string,
  strokes: Stroke[]
): Promise<boolean> => {
  try {
    const response = await axiosInstance.post(
      `/api/doodle/${roomId}/strokes/batch`,
      { strokes }
    );
    return response.data.success;
  } catch (error) {
    console.error("Error batch saving strokes:", error);
    return false;
  }
};

const doodleService = {
  fetchStrokes,
  saveStroke,
  clearRoomStrokes,
  batchSaveStrokes,
};

export default doodleService;
