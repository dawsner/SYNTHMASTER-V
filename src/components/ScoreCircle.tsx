"use client";
import { scoreColor, scoreLabel } from "@/lib/utils";

interface Props {
  score: number;
  size?: "sm" | "lg";
}

export default function ScoreCircle({ score, size = "lg" }: Props) {
  const radius = size === "lg" ? 54 : 36;
  const stroke = size === "lg" ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;
  const dim = (radius + stroke) * 2;
  const center = radius + stroke;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#1f2937"
            strokeWidth={stroke}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444"}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${size === "lg" ? "text-3xl" : "text-xl"} ${scoreColor(score)}`}>
            {score}
          </span>
          {size === "lg" && (
            <span className="text-xs text-gray-500 mt-0.5">/ 100</span>
          )}
        </div>
      </div>
      {size === "lg" && (
        <span className={`text-sm font-medium ${scoreColor(score)}`}>
          {scoreLabel(score)}
        </span>
      )}
    </div>
  );
}
