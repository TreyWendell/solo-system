"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

interface WeeklyChartProps {
  data: number[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const chartData = data.map((xp, i) => ({
    day: format(subDays(new Date(), 6 - i), "EEE"),
    xp,
  }));

  return (
    <div className="glass rounded-xl p-5 border border-[#1e2d4a]">
      <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b] mb-4">
        Weekly XP
      </h3>
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#0a0f1e",
                border: "1px solid #1e2d4a",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#e2e8f0",
              }}
              formatter={(value) => [`${value} XP`, "Earned"]}
            />
            <Area
              type="monotone"
              dataKey="xp"
              stroke="#00d4ff"
              strokeWidth={2}
              fill="url(#xpGradient)"
              dot={{ fill: "#00d4ff", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#00d4ff", stroke: "#050810", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
