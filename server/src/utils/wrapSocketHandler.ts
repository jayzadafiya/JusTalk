export function bindAndWrap(
  socket: any,
  handler: (...args: any[]) => Promise<any> | any,
  opts?: { errorEvent?: string }
) {
  return (...args: any[]) => {
    Promise.resolve(handler(socket, ...args)).catch((err) => {
      console.error("Socket handler error:", err);
      try {
        if (opts?.errorEvent && socket && typeof socket.emit === "function") {
          socket.emit(opts.errorEvent, {
            message: "Internal server error",
            error: err instanceof Error ? err.message : String(err),
          });
        }
      } catch (emitErr) {
        console.error("Failed to emit socket error event:", emitErr);
      }
    });
  };
}
