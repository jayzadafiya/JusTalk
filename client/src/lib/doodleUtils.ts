import type { Point, Stroke, EncodedStroke } from "@types";
import { v4 as uuidv4 } from "uuid";

/**
 * Calculate distance between two points
 */
function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Sample and reduce points using Douglas-Peucker algorithm
 * Reduces number of points while maintaining stroke shape
 *
 * @param points - Raw points array
 * @param epsilon - Tolerance (higher = more aggressive reduction)
 * @returns Sampled points array
 */
export function samplePoints(
  points: Point[],
  epsilon: number = 0.002
): Point[] {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let maxIndex = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > maxDistance) {
      maxDistance = d;
      maxIndex = i;
    }
  }

  if (maxDistance > epsilon) {
    const left = samplePoints(points.slice(0, maxIndex + 1), epsilon);
    const right = samplePoints(points.slice(maxIndex), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [points[0], points[end]];
}

/**
 * Calculate perpendicular distance from point to line segment
 */
function perpendicularDistance(
  point: Point,
  lineStart: Point,
  lineEnd: Point
): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const norm = Math.sqrt(dx * dx + dy * dy);

  if (norm === 0) {
    return distance(point, lineStart);
  }

  const u =
    ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) /
    (norm * norm);

  if (u < 0) {
    return distance(point, lineStart);
  } else if (u > 1) {
    return distance(point, lineEnd);
  }

  const ix = lineStart.x + u * dx;
  const iy = lineStart.y + u * dy;
  return Math.sqrt((point.x - ix) ** 2 + (point.y - iy) ** 2);
}

/**
 * Smooth points using quadratic Bézier interpolation
 * Creates smooth curves between control points
 *
 * @param points - Points to smooth
 * @param segmentsPerCurve - Number of segments per curve (higher = smoother)
 * @returns Smoothed points
 */
export function smoothPoints(
  points: Point[],
  segmentsPerCurve: number = 4
): Point[] {
  if (points.length < 3) return points;

  const smoothed: Point[] = [points[0]];

  for (let i = 0; i < points.length - 2; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const p2 = points[i + 2];

    const cx = (p0.x + p1.x) / 2;
    const cy = (p0.y + p1.y) / 2;

    for (let t = 0; t <= segmentsPerCurve; t++) {
      const ratio = t / segmentsPerCurve;
      const invRatio = 1 - ratio;

      const x =
        invRatio * invRatio * cx +
        2 * invRatio * ratio * p1.x +
        ratio * ratio * p2.x;
      const y =
        invRatio * invRatio * cy +
        2 * invRatio * ratio * p1.y +
        ratio * ratio * p2.y;

      smoothed.push({
        x,
        y,
        pressure: p1.pressure,
        t: p0.t + (p2.t - p0.t) * ratio,
      });
    }
  }

  smoothed.push(points[points.length - 1]);
  return smoothed;
}

/**
 * Sample and smooth points for optimal network transfer
 * Combines sampling and smoothing for best results
 *
 * @param points - Raw points
 * @param epsilon - Sampling tolerance
 * @returns Processed points
 */
export function sampleAndSmoothPoints(
  points: Point[],
  epsilon: number = 0.002
): Point[] {
  if (points.length < 2) return points;

  const sampled = samplePoints(points, epsilon);

  return smoothPoints(sampled, 3);
}

/**
 * Encode stroke to compact format for network transfer
 * Converts normalized 0..1 coordinates to 16-bit integers
 *
 * @param stroke - Stroke to encode
 * @returns Encoded stroke
 */
export function encodeStroke(stroke: Stroke): EncodedStroke {
  const encodedPoints = new Uint16Array(stroke.points.length * 4);

  let idx = 0;
  for (const point of stroke.points) {
    encodedPoints[idx++] = Math.round(point.x * 65535);
    encodedPoints[idx++] = Math.round(point.y * 65535);
    encodedPoints[idx++] = Math.round((point.pressure ?? 0.5) * 65535);

    const timeDelta = Math.min(point.t - stroke.startTime, 65535);
    encodedPoints[idx++] = timeDelta;
  }

  return {
    strokeId: stroke.strokeId,
    userId: stroke.userId,
    roomId: stroke.roomId,
    color: stroke.color,
    width: stroke.width,
    encodedPoints,
    startTime: stroke.startTime,
    endTime: stroke.endTime,
    meta: stroke.meta,
  };
}

/**
 * Decode encoded stroke back to normal format
 *
 * @param encoded - Encoded stroke
 * @returns Decoded stroke
 */
export function decodeStroke(encoded: EncodedStroke): Stroke {
  const points: Point[] = [];

  for (let i = 0; i < encoded.encodedPoints.length; i += 4) {
    points.push({
      x: encoded.encodedPoints[i] / 65535,
      y: encoded.encodedPoints[i + 1] / 65535,
      pressure: encoded.encodedPoints[i + 2] / 65535,
      t: encoded.startTime + encoded.encodedPoints[i + 3],
    });
  }

  return {
    strokeId: encoded.strokeId,
    userId: encoded.userId,
    roomId: encoded.roomId,
    color: encoded.color,
    width: encoded.width,
    points,
    startTime: encoded.startTime,
    endTime: encoded.endTime,
    meta: encoded.meta,
  };
}

/**
 * Normalize raw canvas coordinates to 0..1 range
 *
 * @param x - Raw x coordinate
 * @param y - Raw y coordinate
 * @param width - Canvas width
 * @param height - Canvas height
 * @param pressure - Optional pressure value
 * @param timestamp - Timestamp
 * @returns Normalized point
 */
export function normalizePoint(
  x: number,
  y: number,
  width: number,
  height: number,
  pressure?: number,
  timestamp?: number
): Point {
  return {
    x: x / width,
    y: y / height,
    pressure: pressure ?? 0.5,
    t: timestamp ?? Date.now(),
  };
}

/**
 * Denormalize point from 0..1 range to canvas coordinates
 *
 * @param point - Normalized point
 * @param width - Canvas width
 * @param height - Canvas height
 * @returns Canvas coordinates
 */
export function denormalizePoint(
  point: Point,
  width: number,
  height: number
): { x: number; y: number; pressure: number } {
  return {
    x: point.x * width,
    y: point.y * height,
    pressure: point.pressure ?? 0.5,
  };
}

/**
 * Create a new stroke object
 *
 * @param roomId - Room ID
 * @param userId - User ID
 * @param color - Stroke color
 * @param width - Stroke width
 * @param meta - Optional metadata
 * @returns New stroke
 */
export function createStroke(
  roomId: string,
  userId: string,
  color: string,
  width: number,
  meta?: Record<string, unknown>
): Stroke {
  return {
    strokeId: uuidv4(),
    roomId,
    userId,
    color,
    width,
    points: [],
    startTime: Date.now(),
    meta,
  };
}

/**
 * Render stroke on canvas with quadratic curves
 *
 * @param ctx - Canvas 2D context
 * @param stroke - Stroke to render
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 */
export function renderStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (stroke.points.length === 0) return;

  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();

  const firstPoint = denormalizePoint(
    stroke.points[0],
    canvasWidth,
    canvasHeight
  );
  ctx.moveTo(firstPoint.x, firstPoint.y);

  if (stroke.points.length === 1) {
    ctx.arc(firstPoint.x, firstPoint.y, stroke.width / 2, 0, Math.PI * 2);
    ctx.fillStyle = stroke.color;
    ctx.fill();
    return;
  }

  for (let i = 1; i < stroke.points.length - 1; i++) {
    const current = denormalizePoint(
      stroke.points[i],
      canvasWidth,
      canvasHeight
    );
    const next = denormalizePoint(
      stroke.points[i + 1],
      canvasWidth,
      canvasHeight
    );

    const cpX = (current.x + next.x) / 2;
    const cpY = (current.y + next.y) / 2;

    ctx.quadraticCurveTo(current.x, current.y, cpX, cpY);
  }

  if (stroke.points.length > 1) {
    const lastPoint = denormalizePoint(
      stroke.points[stroke.points.length - 1],
      canvasWidth,
      canvasHeight
    );
    ctx.lineTo(lastPoint.x, lastPoint.y);
  }

  ctx.stroke();
}

/**
 * Clear canvas
 *
 * @param ctx - Canvas 2D context
 * @param width - Canvas width
 * @param height - Canvas height
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
}

/**
 * Validate stroke data
 * Ensures stroke doesn't exceed size limits
 *
 * @param stroke - Stroke to validate
 * @param maxPoints - Maximum allowed points
 * @returns True if valid
 */
export function validateStroke(
  stroke: Stroke,
  maxPoints: number = 1000
): boolean {
  if (!stroke.strokeId || !stroke.userId || !stroke.roomId) return false;
  if (stroke.points.length > maxPoints) return false;
  if (stroke.width < 1 || stroke.width > 50) return false;
  if (!isValidHexColor(stroke.color)) return false;
  return true;
}

/**
 * Validate hex color format
 */
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Sanitize color value
 * Ensures color is valid hex format
 *
 * @param color - Color to sanitize
 * @param defaultColor - Default color if invalid
 * @returns Sanitized color
 */
export function sanitizeColor(
  color: string,
  defaultColor: string = "#000000"
): string {
  return isValidHexColor(color) ? color : defaultColor;
}

/**
 * Sanitize stroke width
 * Clamps width to valid range
 *
 * @param width - Width to sanitize
 * @param min - Minimum width
 * @param max - Maximum width
 * @returns Sanitized width
 */
export function sanitizeWidth(
  width: number,
  min: number = 1,
  max: number = 50
): number {
  return Math.max(min, Math.min(max, width));
}

/**
 * Prune oldest strokes to maintain memory bounds
 *
 * @param strokes - Array of strokes
 * @param maxStrokes - Maximum strokes to keep
 * @returns Pruned strokes array
 */
export function pruneStrokes(strokes: Stroke[], maxStrokes: number): Stroke[] {
  if (strokes.length <= maxStrokes) return strokes;

  return strokes.slice(strokes.length - maxStrokes);
}

/**
 * Deduplicate strokes by strokeId
 *
 * @param strokes - Array of strokes
 * @returns Deduplicated array
 */
export function deduplicateStrokes(strokes: Stroke[]): Stroke[] {
  const seen = new Set<string>();
  return strokes.filter((stroke) => {
    if (seen.has(stroke.strokeId)) return false;
    seen.add(stroke.strokeId);
    return true;
  });
}

/**
 * Merge and sort strokes by start time
 *
 * @param strokes1 - First array
 * @param strokes2 - Second array
 * @returns Merged and sorted array
 */
export function mergeStrokes(strokes1: Stroke[], strokes2: Stroke[]): Stroke[] {
  const merged = deduplicateStrokes([...strokes1, ...strokes2]);
  return merged.sort((a, b) => a.startTime - b.startTime);
}
