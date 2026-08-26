import type { HTMLAttributes, ReactNode } from "react";
import "./Badge.scss";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
};

export default function Badge({
  children,
  variant = "neutral",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`badge badge--${variant} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}