import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.scss";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`button button--${variant} ${
        fullWidth ? "button--full" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}