import type { HTMLAttributes, ReactNode } from "react";
import "./Card.scss";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: "sm" | "md" | "lg";
};

export default function Card({
  children,
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`card card--${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}