"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const sentimentData = [
  { time: "00:00", positive: 65, negative: 25, neutral: 45 },
  { time: "04:00", positive: 72, negative: 18, neutral: 52 },
  { time: "08:00", positive: 58, negative: 35, neutral: 48 },
  { time: "12:00", positive: 81, negative: 15, neutral: 55 },
  { time: "16:00", positive: 69, negative: 28, neutral: 51 },
  { time: "20:00", positive: 75, negative: 22, neutral: 49 },
]

export function SentimentChart() {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sentimentData}>
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="positive"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(var(--chart-1))" }}
          />
          <Line
            type="monotone"
            dataKey="negative"
            stroke="hsl(var(--chart-3))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(var(--chart-3))" }}
          />
          <Line
            type="monotone"
            dataKey="neutral"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(var(--chart-2))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
