// Why this component exists:
// This is a reusable Loading Spinner component. It supports inline spinning 
// and full-page overlay modes (useful during initial authentication checks or heavy page builds).

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", fullPage = false }) => {
  // Define size classes based on prop
  const sizeClasses = {
    sm: "h-5 w-5 stroke-[3px]",
    md: "h-8 w-8 stroke-[2.5px]",
    lg: "h-12 w-12 stroke-[2px]",
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Spinner SVG */}
      <svg
        className={`animate-spin text-indigo-500 ${sizeClasses[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-15"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-85"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {fullPage && (
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
          Loading Portal...
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
