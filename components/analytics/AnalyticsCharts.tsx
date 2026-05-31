'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function RevenueChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary-color, #2563EB)" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="var(--primary-color, #2563EB)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
        <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Sales (₹)"
          stroke="var(--primary-color, #2563EB)"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#colorRev)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BestSellersChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
        <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
        <Tooltip />
        <Bar dataKey="sales" name="Revenue (₹)" fill="var(--secondary-color, #0EA5E9)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PaymentChannelsChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
