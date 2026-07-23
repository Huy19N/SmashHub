import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartTooltip } from '../../../../components/ui/ChartTooltip';

export function PlatformRevenueChart({ data = [] }) {
  const formatVND = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}tr`;
    }
    return value.toLocaleString('vi-VN');
  };

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0BE860" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#0BE860" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis 
            dataKey="month" 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            tickLine={false} 
            axisLine={false} 
            dy={5}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={formatVND}
          />
          <Tooltip 
            content={<ChartTooltip />} 
            formatter={(value) => [`${value.toLocaleString('vi-VN')} VNĐ`]}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            name="Doanh thu Platform"
            stroke="#0BE860" 
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            strokeWidth={3.5}
            dot={{ r: 4, fill: '#0b0f19', stroke: '#0BE860', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: '#0BE860', stroke: '#ffffff', strokeWidth: 2 }}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
