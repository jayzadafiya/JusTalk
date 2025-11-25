// User related types
export interface User {
  _id: string;
  username: string;
  firstName: string;
  birthdate: string;
  email?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Auth related types
export interface SignupData {
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  birthdate: string;
  email?: string;
  phone?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  errors?: Array<{
    field?: string;
    message: string;
  }>;
  field?: string;
}

export interface UsernameCheckResponse {
  success: boolean;
  available: boolean;
  message: string;
}

// Board related types
export interface Task {
  id: string;
  listId: string;
  title: string;
  description: string;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
  tags: string[];
  assignedTo?: string;
  createdAt: Date;
}

export interface List {
  id: string;
  boardId: string;
  title: string;
  order: number;
  createdAt: Date;
}

export interface Board {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  members: string[];
}

// Room related types
export interface Room {
  _id: string;
  code: string;
  name: string;
  createdBy: User | string;
  participants: User[] | string[];
  connectedUsers: User[] | string[];
  maxParticipants: number;
  hasPassword?: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomData {
  name: string;
  password?: string;
  maxParticipants?: number;
}

export interface JoinRoomData {
  code: string;
  password?: string;
}

export interface Participant {
  socketId: string;
  userId: string;
  username: string;
}
export interface RoomResponse {
  success: boolean;
  message?: string;
  data?: {
    room: Room;
  };
  errors?: Array<{
    field?: string;
    message: string;
  }>;
  field?: string;
}

export interface RemoteVideoProps {
  peer: {
    socketId: string;
    userId: string;
    username: string;
    stream?: MediaStream;
  };
  mediaState?: {
    audioEnabled: boolean;
    videoEnabled: boolean;
  };
}
