import { Socket } from "socket.io-client";

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  t: number;
}

export interface Stroke {
  strokeId: string;
  userId: string;
  roomId: string;
  color: string;
  width: number;
  points: Point[];
  startTime: number;
  endTime?: number;
  meta?: Record<string, unknown>;
}

export interface StrokeStartPayload {
  roomId: string;
  strokeId: string;
  userId: string;
  color: string;
  width: number;
  meta?: Record<string, unknown>;
}

export interface StrokePointsPayload {
  roomId: string;
  strokeId: string;
  points: Point[];
  sequence: number;
}

export interface StrokeEndPayload {
  roomId: string;
  strokeId: string;
  userId: string;
  timestamp: number;
}

export interface CanvasClearPayload {
  roomId: string;
  userId: string;
  confirmed: boolean;
}

export interface UndoStrokePayload {
  roomId: string;
  userId: string;
  strokeId: string;
}

export interface SyncRequestPayload {
  roomId: string;
  userId: string;
  since?: number;
}

export interface SyncResponsePayload {
  roomId: string;
  strokes: Stroke[];
}

export interface DoodleCanvasProps {
  roomId: string;
  userId: string;
  socket: Socket;
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  maxStrokes?: number;
  enabled?: boolean;
  onDrawingStateChange?: (isDrawing: boolean) => void;
  onUndoStackChange?: (canUndo: boolean) => void;
  className?: string;
}

export interface DoodleCanvasRef {
  undo: () => void;
  clear: (confirmed?: boolean) => void;
}

export interface FetchStrokesResponse {
  success: boolean;
  data?: {
    strokes: Stroke[];
    total: number;
  };
  message?: string;
}

export interface SaveStrokeResponse {
  success: boolean;
  data?: {
    stroke: Stroke;
  };
  message?: string;
}

export interface DrawingState {
  isDrawing: boolean;
  currentStroke: Stroke | null;
  currentPoints: Point[];
  lastEmitTime: number;
  sequence: number;
}

export interface UndoEntry {
  strokeId: string;
  stroke: Stroke;
}

export interface CanvasContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
}

export interface EncodedStroke {
  strokeId: string;
  userId: string;
  roomId: string;
  color: string;
  width: number;
  encodedPoints: Uint16Array;
  startTime: number;
  endTime?: number;
  meta?: Record<string, unknown>;
}

export interface DrawingTool {
  type: "pen" | "eraser" | "highlighter";
  color: string;
  width: number;
  opacity?: number;
}

export interface DoodleSocketEvents {
  "doodle:stroke:start": (payload: StrokeStartPayload) => void;
  "doodle:stroke:points": (payload: StrokePointsPayload) => void;
  "doodle:stroke:end": (payload: StrokeEndPayload) => void;
  "doodle:canvas:clear": (payload: CanvasClearPayload) => void;
  "doodle:stroke:undo": (payload: UndoStrokePayload) => void;
  "doodle:sync:request": (payload: SyncRequestPayload) => void;

  "doodle:sync:response": (payload: SyncResponsePayload) => void;
  "doodle:remote:stroke:start": (payload: StrokeStartPayload) => void;
  "doodle:remote:stroke:points": (payload: StrokePointsPayload) => void;
  "doodle:remote:stroke:end": (payload: StrokeEndPayload) => void;
  "doodle:remote:canvas:clear": (payload: CanvasClearPayload) => void;
  "doodle:remote:stroke:undo": (payload: UndoStrokePayload) => void;
}
