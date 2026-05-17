"use client";

import {
  RadarChart as RechartsRadar,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarChartProps {
  data: Array<{ subject: string; value: number; fullMark: number }>;
}

export function RadarChart({ data }: RadarChartProps) {
  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar
          data={data}
          margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
        >
          <PolarGrid stroke="#1e2d4a" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
          />
          <Tooltip
            contentStyle={{
              background: "#0a0f1e",
              border: "1px solid #1e2d4a",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: "12px",
            }}
            formatter={(value) => [`Level ${value}`, "Level"]}
          />
          <Radar
            name="Stats"
            dataKey="value"
            stroke="#00d4ff"
            fill="#00d4ff"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ fill: "#00d4ff", r: 4, strokeWidth: 0 }}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
