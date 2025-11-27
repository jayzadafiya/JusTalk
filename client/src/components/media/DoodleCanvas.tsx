import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import type {
  DoodleCanvasProps,
  DoodleCanvasRef,
  Stroke,
  DrawingState,
  UndoEntry,
  StrokeStartPayload,
  StrokePointsPayload,
  StrokeEndPayload,
  CanvasClearPayload,
  UndoStrokePayload,
  SyncRequestPayload,
  SyncResponsePayload,
} from "@types";
import {
  createStroke,
  normalizePoint,
  renderStroke,
  clearCanvas,
  pruneStrokes,
  mergeStrokes,
  sampleAndSmoothPoints,
} from "@lib/doodleUtils";

const EMIT_THROTTLE_MS = 33;
const POINT_BUFFER_THRESHOLD = 10;
const DEFAULT_STROKE_COLOR = "#000000";
const DEFAULT_STROKE_WIDTH = 3;
const DEFAULT_MAX_STROKES = 500;

export const DoodleCanvas = forwardRef<DoodleCanvasRef, DoodleCanvasProps>(
  (
    {
      roomId,
      userId,
      socket,
      width,
      height,
      strokeColor = DEFAULT_STROKE_COLOR,
      strokeWidth = DEFAULT_STROKE_WIDTH,
      maxStrokes = DEFAULT_MAX_STROKES,
      enabled = true,
      onDrawingStateChange,
      onUndoStackChange,
      className = "",
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const rafIdRef = useRef<number | null>(null);

    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [drawingState, setDrawingState] = useState<DrawingState>({
      isDrawing: false,
      currentStroke: null,
      currentPoints: [],
      lastEmitTime: 0,
      sequence: 0,
    });
    const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);
    const [remoteStrokes, setRemoteStrokes] = useState<Map<string, Stroke>>(
      new Map()
    );
    const [canvasDimensions, setCanvasDimensions] = useState({
      width: 0,
      height: 0,
    });
    const [, setDpr] = useState(window.devicePixelRatio || 1);

    const undoStackRef = useRef<UndoEntry[]>([]);
    const strokesRef = useRef<Stroke[]>([]);

    useEffect(() => {
      undoStackRef.current = undoStack;
      strokesRef.current = strokes;
    }, [undoStack, strokes]);

    useEffect(() => {
      onUndoStackChange?.(undoStack.length > 0);
    }, [undoStack, onUndoStackChange]);

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const updateCanvasSize = () => {
        const dpr = window.devicePixelRatio || 1;
        setDpr(dpr);

        const displayWidth = width || container.clientWidth;
        const displayHeight = height || container.clientHeight;

        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        setCanvasDimensions({ width: displayWidth, height: displayHeight });

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(dpr, dpr);
          redrawAllStrokes();
        }
      };

      updateCanvasSize();

      const resizeObserver = new ResizeObserver(updateCanvasSize);
      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
      };
    }, [width, height]);

    const redrawAllStrokes = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      clearCanvas(ctx, canvasDimensions.width, canvasDimensions.height);

      [...strokes, ...remoteStrokes.values()].forEach((stroke) => {
        renderStroke(
          ctx,
          stroke,
          canvasDimensions.width,
          canvasDimensions.height
        );
      });

      if (
        drawingState.currentStroke &&
        drawingState.currentStroke.points.length > 0
      ) {
        renderStroke(
          ctx,
          drawingState.currentStroke,
          canvasDimensions.width,
          canvasDimensions.height
        );
      }
    }, [strokes, remoteStrokes, drawingState, canvasDimensions]);

    useEffect(() => {
      const animate = () => {
        redrawAllStrokes();
        rafIdRef.current = requestAnimationFrame(animate);
      };

      rafIdRef.current = requestAnimationFrame(animate);

      return () => {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
        }
      };
    }, [redrawAllStrokes]);

    const emitStrokePoints = useCallback(
      (force: boolean = false) => {
        if (!drawingState.currentStroke) return;

        const now = Date.now();
        const shouldEmit =
          force ||
          drawingState.currentPoints.length >= POINT_BUFFER_THRESHOLD ||
          now - drawingState.lastEmitTime >= EMIT_THROTTLE_MS;

        if (!shouldEmit || drawingState.currentPoints.length === 0) return;

        const payload: StrokePointsPayload = {
          roomId,
          strokeId: drawingState.currentStroke.strokeId,
          points: drawingState.currentPoints,
          sequence: drawingState.sequence,
        };

        socket.emit("doodle:stroke:points", payload);

        setDrawingState((prev) => ({
          ...prev,
          currentPoints: [],
          lastEmitTime: now,
          sequence: prev.sequence + 1,
        }));
      },
      [drawingState, roomId, socket]
    );

    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!enabled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const pressure = e.pressure || 0.5;

        const point = normalizePoint(
          x,
          y,
          canvasDimensions.width,
          canvasDimensions.height,
          pressure
        );

        const newStroke = createStroke(
          roomId,
          userId,
          strokeColor,
          strokeWidth
        );

        newStroke.points = [point];

        setDrawingState({
          isDrawing: true,
          currentStroke: newStroke,
          currentPoints: [point],
          lastEmitTime: Date.now(),
          sequence: 0,
        });

        const payload: StrokeStartPayload = {
          roomId,
          strokeId: newStroke.strokeId,
          userId,
          color: strokeColor,
          width: strokeWidth,
        };
        socket.emit("doodle:stroke:start", payload);

        onDrawingStateChange?.(true);

        canvas.setPointerCapture(e.pointerId);
      },
      [
        enabled,
        roomId,
        userId,
        strokeColor,
        strokeWidth,
        canvasDimensions,
        socket,
        onDrawingStateChange,
      ]
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawingState.isDrawing || !drawingState.currentStroke) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const pressure = e.pressure || 0.5;

        const point = normalizePoint(
          x,
          y,
          canvasDimensions.width,
          canvasDimensions.height,
          pressure
        );

        setDrawingState((prev) => ({
          ...prev,
          currentStroke: prev.currentStroke
            ? {
                ...prev.currentStroke,
                points: [...prev.currentStroke.points, point],
              }
            : null,
          currentPoints: [...prev.currentPoints, point],
        }));

        emitStrokePoints(false);
      },
      [drawingState, canvasDimensions, emitStrokePoints]
    );

    const handlePointerUp = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawingState.isDrawing || !drawingState.currentStroke) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        emitStrokePoints(true);

        const completedStroke: Stroke = {
          ...drawingState.currentStroke,
          points: [
            ...drawingState.currentStroke.points,
            ...drawingState.currentPoints,
          ],
          endTime: Date.now(),
        };

        const processedStroke: Stroke = {
          ...completedStroke,
          points: sampleAndSmoothPoints(completedStroke.points),
        };

        const payload: StrokeEndPayload = {
          roomId,
          strokeId: processedStroke.strokeId,
          userId,
          timestamp: processedStroke.endTime || Date.now(),
        };
        socket.emit("doodle:stroke:end", payload);

        setStrokes((prev) =>
          pruneStrokes([...prev, processedStroke], maxStrokes)
        );
        setUndoStack((prev) => [
          ...prev,
          { strokeId: processedStroke.strokeId, stroke: processedStroke },
        ]);

        setDrawingState({
          isDrawing: false,
          currentStroke: null,
          currentPoints: [],
          lastEmitTime: 0,
          sequence: 0,
        });

        onDrawingStateChange?.(false);

        canvas.releasePointerCapture(e.pointerId);
      },
      [
        drawingState,
        roomId,
        userId,
        socket,
        maxStrokes,
        emitStrokePoints,
        onDrawingStateChange,
      ]
    );

    const handleUndo = useCallback(() => {
      if (undoStackRef.current.length === 0) return;

      const lastEntry = undoStackRef.current[undoStackRef.current.length - 1];

      const payload: UndoStrokePayload = {
        roomId,
        userId,
        strokeId: lastEntry.strokeId,
      };
      socket.emit("doodle:stroke:undo", payload);

      setStrokes(
        strokesRef.current.filter((s) => s.strokeId !== lastEntry.strokeId)
      );

      setUndoStack(undoStackRef.current.slice(0, -1));

      redrawAllStrokes();
    }, [roomId, userId, socket, redrawAllStrokes]);

    const handleClear = useCallback(
      (confirmed: boolean = false) => {
        if (!confirmed) {
          if (!window.confirm("Clear the canvas for everyone in the room?")) {
            return;
          }
        }

        const payload: CanvasClearPayload = {
          roomId,
          userId,
          confirmed: true,
        };

        socket.emit("doodle:canvas:clear", payload);

        setStrokes([]);
        setRemoteStrokes(new Map());
        setUndoStack([]);

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            clearCanvas(ctx, canvasDimensions.width, canvasDimensions.height);
          }
        }
      },
      [roomId, userId, socket, canvasDimensions]
    );

    useImperativeHandle(
      ref,
      () => ({
        undo: handleUndo,
        clear: handleClear,
      }),
      [handleUndo, handleClear]
    );

    useEffect(() => {
      const requestSync = () => {
        const payload: SyncRequestPayload = {
          roomId,
          userId,
        };
        socket.emit("doodle:sync:request", payload);
      };

      requestSync();

      const handleReconnect = () => {
        requestSync();
      };

      socket.on("connect", handleReconnect);

      return () => {
        socket.off("connect", handleReconnect);
      };
    }, [roomId, userId, socket]);

    useEffect(() => {
      const handleRemoteStrokeStart = (payload: StrokeStartPayload) => {
        if (payload.userId === userId) return;

        const newStroke = createStroke(
          payload.roomId,
          payload.userId,
          payload.color,
          payload.width,
          payload.meta
        );
        newStroke.strokeId = payload.strokeId;

        setRemoteStrokes((prev) =>
          new Map(prev).set(payload.strokeId, newStroke)
        );
      };

      const handleRemoteStrokePoints = (payload: StrokePointsPayload) => {
        setRemoteStrokes((prev) => {
          const updated = new Map(prev);
          const stroke = updated.get(payload.strokeId);
          if (stroke) {
            stroke.points = [...stroke.points, ...payload.points];
            updated.set(payload.strokeId, stroke);
          }
          return updated;
        });
      };

      const handleRemoteStrokeEnd = (payload: StrokeEndPayload) => {
        setRemoteStrokes((prev) => {
          const updated = new Map(prev);
          const stroke = updated.get(payload.strokeId);
          if (stroke) {
            stroke.endTime = payload.timestamp;
            setStrokes((current) =>
              pruneStrokes([...current, stroke], maxStrokes)
            );
            updated.delete(payload.strokeId);
          }
          return updated;
        });
      };

      const handleRemoteCanvasClear = (payload: CanvasClearPayload) => {
        if (payload.userId === userId) return;

        setStrokes([]);
        setRemoteStrokes(new Map());
        setUndoStack([]);

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            clearCanvas(ctx, canvasDimensions.width, canvasDimensions.height);
          }
        }
      };

      const handleRemoteUndo = (payload: UndoStrokePayload) => {
        setStrokes((prev) =>
          prev.filter((s) => s.strokeId !== payload.strokeId)
        );

        setRemoteStrokes((prev) => {
          const updated = new Map(prev);
          updated.delete(payload.strokeId);
          return updated;
        });

        setUndoStack((prev) =>
          prev.filter((entry) => entry.strokeId !== payload.strokeId)
        );
      };

      const handleSyncResponse = (payload: SyncResponsePayload) => {
        if (payload.roomId !== roomId) return;
        setStrokes((prev) => {
          const merged = mergeStrokes(prev, payload.strokes);
          return pruneStrokes(merged, maxStrokes);
        });
      };

      socket.on("doodle:remote:stroke:start", handleRemoteStrokeStart);
      socket.on("doodle:remote:stroke:points", handleRemoteStrokePoints);
      socket.on("doodle:remote:stroke:end", handleRemoteStrokeEnd);
      socket.on("doodle:remote:canvas:clear", handleRemoteCanvasClear);
      socket.on("doodle:remote:stroke:undo", handleRemoteUndo);
      socket.on("doodle:sync:response", handleSyncResponse);

      return () => {
        socket.off("doodle:remote:stroke:start", handleRemoteStrokeStart);
        socket.off("doodle:remote:stroke:points", handleRemoteStrokePoints);
        socket.off("doodle:remote:stroke:end", handleRemoteStrokeEnd);
        socket.off("doodle:remote:canvas:clear", handleRemoteCanvasClear);
        socket.off("doodle:remote:stroke:undo", handleRemoteUndo);
        socket.off("doodle:sync:response", handleSyncResponse);
      };
    }, [socket, roomId, userId, maxStrokes, canvasDimensions]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        }

        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "K") {
          e.preventDefault();
          handleClear(false);
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [handleUndo, handleClear]);

    return (
      <div
        ref={containerRef}
        className={`absolute inset-0 ${className}`}
        style={{
          touchAction: "none",
          pointerEvents: enabled ? "auto" : "none",
          zIndex: enabled ? 10 : 1,
          backgroundColor: "transparent",
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 w-full h-full"
          style={{
            cursor: enabled ? "crosshair" : "default",
            touchAction: "none",
            backgroundColor: "transparent",
          }}
        />
      </div>
    );
  }
);

DoodleCanvas.displayName = "DoodleCanvas";

export default DoodleCanvas;
