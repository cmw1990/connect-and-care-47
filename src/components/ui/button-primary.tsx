import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonPrimaryProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

const ButtonPrimary = React.forwardRef<HTMLButtonElement, ButtonPrimaryProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary hover:bg-primary-600 text-primary-foreground shadow": variant === "default",
            "border border-primary hover:bg-primary-100 text-primary": variant === "outline",
            "h-9 px-4 py-2": size === "default",
            "h-8 px-3": size === "sm",
            "h-10 px-8": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
ButtonPrimary.displayName = "ButtonPrimary";

export { ButtonPrimary };