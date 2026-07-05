import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartTooltip } from '../../../../components/ui/ChartTooltip';

export function PlatformRevenueChart({ data }) {
  const formatVND = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}tr`;
    }
    return value.toLocaleString('vi-VN');
  };

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
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
            stroke="hsl(var(--primary))" 
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            strokeWidth={3}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
