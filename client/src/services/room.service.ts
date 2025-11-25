import api from "@lib/axios";
import { AxiosError } from "axios";
import type { CreateRoomData, JoinRoomData, RoomResponse, Room } from "@types";

export const createRoom = async (
  data: CreateRoomData
): Promise<RoomResponse> => {
  try {
    const response = await api.post<RoomResponse>("/room/create", data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

export const joinRoom = async (data: JoinRoomData): Promise<RoomResponse> => {
  try {
    const response = await api.post<RoomResponse>("/room/join", data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

export const leaveRoom = async (code: string): Promise<RoomResponse> => {
  try {
    const response = await api.post<RoomResponse>(`/room/leave/${code}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

export const getRoomByCode = async (code: string): Promise<RoomResponse> => {
  try {
    const response = await api.get<RoomResponse>(`/room/${code}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

export const getUserRooms = async (): Promise<{
  success: boolean;
  data: { rooms: Room[] };
}> => {
  try {
    const response = await api.get("/room");
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

export const getActiveRooms = getUserRooms;
