import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartTooltip } from '../../../../components/ui/ChartTooltip';

export function RevenueChart({ data }) {
  const formatVND = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}tr`;
    }
    return value.toLocaleString('vi-VN');
  };

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            yAxisId="left"
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={formatVND}
          />
          <Tooltip 
            content={<ChartTooltip />} 
            cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
            formatter={(value) => [`${value.toLocaleString('vi-VN')} VNĐ`]}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" />
          <Bar 
            yAxisId="left"
            dataKey="actual" 
            name="Thực tế"
            fill="hsl(var(--primary))" 
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
            animationDuration={1500}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="forecast" 
            name="Dự báo"
            stroke="hsl(var(--chart-2, 210, 100%, 50%))" 
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ r: 4, fill: 'hsl(var(--background))', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            animationDuration={1500}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
