"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface ScoreRadarProps {
  technical: number;
  communication: number;
  honesty: number;
}

export function ScoreRadar({ technical, communication, honesty }: ScoreRadarProps) {
  const data = [
    { subject: "Technical", score: technical, fullMark: 100 },
    { subject: "Communication", score: communication, fullMark: 100 },
    { subject: "Honesty", score: honesty, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[260px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" stroke="#64748b" tick={{ fontSize: 12, fontWeight: 500 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
          <Radar
            name="Candidate Evaluation"
            dataKey="score"
            stroke="#0ea5e9"
            fill="#0ea5e9"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
