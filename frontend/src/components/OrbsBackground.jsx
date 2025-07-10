import React from "react";
import { useTheme } from "@/ThemeContext";

export default function OrbsBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Top right orb */}
      <div
        className={`absolute top-8 right-8 w-80 h-80 rounded-full blur-3xl opacity-40
          ${isDark ? "bg-blue-500" : "bg-pink-300"}
        `}
      />
      {/* Middle left orb */}
      <div
        className={`absolute top-1/2 left-0 w-96 h-96 rounded-full blur-3xl opacity-30 -translate-y-1/2
          ${isDark ? "bg-blue-300" : "bg-pink-200"}
        `}
      />
    </div>
  );
}