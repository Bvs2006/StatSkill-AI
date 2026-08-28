import React from "react";

export type LearningMode = "youtube" | "slides";

interface LearningModeSwitcherProps {
  activeMode: LearningMode;
  onModeChange: (mode: LearningMode) => void;
}

export function LearningModeSwitcher({
  activeMode,
  onModeChange,
}: LearningModeSwitcherProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
      <button
        onClick={() => onModeChange("youtube")}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeMode === "youtube"
            ? "bg-[#0B3D66] text-white shadow-md"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <span>🎥</span>
        <span>YouTube Lecture</span>
      </button>

      <button
        onClick={() => onModeChange("slides")}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeMode === "slides"
            ? "bg-[#FF7A00] text-white shadow-md"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <span>📊</span>
        <span>AI Interactive Slides</span>
      </button>
    </div>
  );
}
