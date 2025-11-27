import React from "react";
import { Pen, Trash2, Undo, X } from "lucide-react";
import { useIsMobile } from "@hooks/useIsMobile";

export interface DoodleToolbarProps {
  isDrawingMode: boolean;
  currentColor: string;
  currentWidth: number;
  onToggleDrawing: () => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
  className?: string;
}

const PRESET_COLORS = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FF6B00",
  "#9B59B6",
];

const STROKE_WIDTHS = [2, 4, 6, 8, 12];

export const DoodleToolbar: React.FC<DoodleToolbarProps> = ({
  isDrawingMode,
  currentColor,
  currentWidth,
  onToggleDrawing,
  onColorChange,
  onWidthChange,
  onUndo,
  onClear,
  canUndo,
  className = "",
}) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showWidthPicker, setShowWidthPicker] = React.useState(false);
  const isMobile = useIsMobile();

  return (
    <div
      className={`bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl ${
        isMobile ? "p-1" : "p-2"
      } ${className} ${isMobile ? "max-w-xs mx-auto" : ""}`}
    >
      <div
        className={`flex items-center ${
          isMobile ? "gap-0.5 justify-center" : "gap-1 flex-wrap"
        }`}
      >
        <button
          onClick={onToggleDrawing}
          className={`p-1.5 rounded-xl transition-all duration-200 hover:scale-105 ${
            isDrawingMode
              ? "bg-red-500 hover:bg-red-600 text-white shadow-lg"
              : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
          }`}
          title={isDrawingMode ? "Disable Drawing" : "Enable Drawing"}
        >
          {isDrawingMode ? <X size={16} /> : <Pen size={16} />}
        </button>

        {isDrawingMode && (
          <>
            <div
              className={`w-px h-6 bg-slate-600/50 ${isMobile ? "mx-1" : ""}`}
            />

            <div className="relative h-[32px]">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`rounded-xl border-2 border-slate-600/50 shadow-sm hover:border-slate-500 transition-all duration-200 hover:scale-105 ${
                  isMobile ? "w-8 h-8" : "w-8 h-8"
                }`}
                style={{ backgroundColor: currentColor }}
                title="Choose Color"
              />
              {showColorPicker && (
                <div
                  className={`absolute top-12 left-0 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2 shadow-2xl z-50 ${
                    isMobile ? "min-w-[180px]" : ""
                  }`}
                >
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          onColorChange(color);
                          setShowColorPicker(false);
                        }}
                        className={`rounded-lg border-2 transition-all duration-200 hover:scale-110 w-8 h-8 ${
                          currentColor === color
                            ? "border-blue-400 ring-2 ring-blue-400/50 ring-offset-1 ring-offset-slate-800"
                            : "border-slate-600/50 hover:border-slate-500"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="w-full h-7 rounded-lg cursor-pointer border border-slate-600/50"
                    title="Custom Color"
                  />
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowWidthPicker(!showWidthPicker)}
                className={`rounded-xl border-2 border-slate-600/50 bg-slate-700/50 hover:border-slate-500 transition-all duration-200 hover:scale-105 flex items-center justify-center ${
                  isMobile ? "w-8 h-8" : "w-8 h-8"
                }`}
                title="Stroke Width"
              >
                <div
                  className="rounded-full bg-white shadow-sm"
                  style={{
                    width: `${Math.min(
                      currentWidth * 1.5,
                      isMobile ? 16 : 12
                    )}px`,
                    height: `${Math.min(
                      currentWidth * 1.5,
                      isMobile ? 16 : 12
                    )}px`,
                  }}
                />
              </button>
              {showWidthPicker && (
                <div
                  className={`absolute top-12 left-0 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2 shadow-2xl z-50 ${
                    isMobile ? "min-w-[140px]" : "min-w-[120px]"
                  }`}
                >
                  <div className="space-y-2">
                    {STROKE_WIDTHS.map((width) => (
                      <button
                        key={width}
                        onClick={() => {
                          onWidthChange(width);
                          setShowWidthPicker(false);
                        }}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200 ${
                          currentWidth === width
                            ? "bg-blue-500/20 border border-blue-400/50"
                            : ""
                        }`}
                      >
                        <div
                          className="rounded-full bg-white shadow-sm"
                          style={{
                            width: `${width * 1.5}px`,
                            height: `${width * 1.5}px`,
                          }}
                        />
                        <span className="text-xs text-slate-300">
                          {width}px
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              className={`w-px h-6 bg-slate-600/50 ${
                isMobile ? "mx-1" : "hidden sm:block"
              }`}
            />

            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-xl transition-all duration-200 hover:scale-105 ${
                canUndo
                  ? "bg-slate-600 hover:bg-slate-500 text-white shadow-lg"
                  : "bg-slate-700/50 text-slate-500 cursor-not-allowed"
              }`}
              title="Undo (Ctrl/Cmd+Z)"
            >
              <Undo size={16} />
            </button>

            <button
              onClick={onClear}
              className="p-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-200 hover:scale-105"
              title="Clear Canvas (Ctrl/Cmd+Shift+K)"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DoodleToolbar;
