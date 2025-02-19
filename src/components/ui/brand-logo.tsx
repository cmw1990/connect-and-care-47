import * as React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const BrandLogo = React.forwardRef<HTMLDivElement, BrandLogoProps>(
  ({ className, size = 32, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative inline-block", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        {/* Heart Container */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
        >
          <path
            d="M50 85C74.5 85 85 70 85 50C85 25.5 70 15 50 15C30 15 15 25.5 15 50C15 70 25.5 85 50 85Z"
            className="fill-primary/10"
          />
          {/* Holding Hands */}
          <path
            d="M35 45C35 45 40 40 50 40C60 40 65 45 65 45"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-primary"
          />
          {/* Left Person */}
          <circle cx="35" cy="35" r="8" className="fill-primary" />
          {/* Right Person */}
          <circle cx="65" cy="35" r="8" className="fill-primary" />
          {/* Smile */}
          <path
            d="M40 60C40 60 43 65 50 65C57 65 60 60 60 60"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-primary"
          />
        </svg>

        {/* Sparkles */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full animate-pulse"
        >
          <circle cx="20" cy="20" r="2" className="fill-primary" />
          <circle cx="80" cy="20" r="2" className="fill-primary" />
          <circle cx="50" cy="15" r="2" className="fill-primary" />
        </svg>
      </div>
    );
  }
);
BrandLogo.displayName = "BrandLogo";

export { BrandLogo };
