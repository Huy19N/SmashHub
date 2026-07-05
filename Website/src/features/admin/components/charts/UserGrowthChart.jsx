import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartTooltip } from '../../../../components/ui/ChartTooltip';

export function UserGrowthChart({ data }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          />
          <Tooltip 
            content={<ChartTooltip />} 
            cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" />
          <Bar 
            dataKey="newUsers" 
            name="Người dùng mới"
            stackId="a" 
            fill="hsl(var(--primary))" 
            radius={[0, 0, 4, 4]}
            animationDuration={1500}
          />
          <Bar 
            dataKey="churnedUsers" 
            name="Người dùng rời đi"
            stackId="a" 
            fill="hsl(var(--destructive))" 
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
