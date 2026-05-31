'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DashboardChartProps {
  data: { hour: string; sales: number }[];
}

export default function DashboardChart({ data }: DashboardChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary-color, #2563EB)" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="var(--primary-color, #2563EB)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="hour" stroke="#94A3B8" fontSize={10} tickLine={false} />
        <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="sales"
          name="Sales (₹)"
          stroke="var(--primary-color, #2563EB)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorSales)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
