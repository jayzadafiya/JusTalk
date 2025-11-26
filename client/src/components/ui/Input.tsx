import type { InputProps } from "@/types";
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon: Icon,
      iconPosition = "left",
      iconButton,
      helperText,
      containerClassName = "",
      className = "",
      type = "text",
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const hasIcon = !!Icon;
    const hasIconButton = !!iconButton;

    return (
      <div className={containerClassName}>
        {label && (
          <label className="block text-xs sm:text-sm text-slate-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {hasIcon && iconPosition === "left" && Icon && (
            <Icon
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          )}
          <input
            ref={ref}
            type={type}
            className={`w-full ${
              hasIcon && iconPosition === "left" ? "pl-10 pr-3" : "px-3"
            } ${
              hasIconButton ? "pr-10" : ""
            } sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-800 border ${
              hasError ? "border-red-500" : "border-slate-700"
            } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-600 transition-colors ${className}`}
            {...props}
          />
          {hasIconButton && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {iconButton}
            </div>
          )}
          {hasIcon && iconPosition === "right" && !hasIconButton && Icon && (
            <Icon
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs sm:text-sm text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
