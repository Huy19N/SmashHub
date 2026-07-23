import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartTooltip } from '../../../../components/ui/ChartTooltip';

export function UserGrowthChart({ data = [] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis 
            dataKey="month" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            content={<ChartTooltip />} 
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
          <Bar 
            dataKey="newUsers" 
            name="Người dùng mới"
            stackId="a" 
            fill="#0BE860" 
            radius={[0, 0, 4, 4]}
            animationDuration={1500}
          />
          <Bar 
            dataKey="churnedUsers" 
            name="Người dùng rời đi"
            stackId="a" 
            fill="#ef4444" 
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
