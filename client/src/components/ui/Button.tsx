import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "font-medium rounded-lg transition-colors flex items-center  gap-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";

    const variantStyles = {
      primary:
        "bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white focus:ring-blue-500 justify-center",
      secondary:
        "bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white focus:ring-slate-500 justify-center",
      outline:
        "border-2 border-blue-600 hover:bg-blue-600/10 disabled:border-slate-700 disabled:text-slate-600 text-blue-600 focus:ring-blue-500 justify-center",
      ghost:
        "hover:bg-slate-800 disabled:text-slate-600 text-slate-300 focus:ring-slate-500 justify-start",
      danger:
        "bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white focus:ring-red-500 justify-center",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs sm:text-sm",
      md: "px-4 py-2.5 sm:py-3 text-sm sm:text-base",
      lg: "px-6 py-3 sm:py-3.5 text-base sm:text-lg",
    };

    const widthStyle = fullWidth ? "w-full" : "";

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
