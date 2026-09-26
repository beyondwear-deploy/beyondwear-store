"use client";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DayPoint } from "@/lib/adminData";

/** Shared line/area trend chart used for both revenue and traffic (YouTube-Studio style). */
export function TrendChart({ data, color = "var(--accent, #f4600d)", valuePrefix = "", height = 220 }: { data: DayPoint[]; color?: string; valuePrefix?: string; height?: number }) {
  const formatted = data.map((d) => ({ ...d, label: d.date.slice(5) })); // MM-DD
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line, #e5e0d5)" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          formatter={(value: number) => [`${valuePrefix}${value.toLocaleString()}`, undefined]}
          labelFormatter={(l) => `${l}`}
          contentStyle={{ borderRadius: 10, border: "1px solid var(--line, #e5e0d5)", fontSize: 12 }}
        />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#trendFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
