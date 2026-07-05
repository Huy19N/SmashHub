import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartTooltip } from '../../../../components/ui/ChartTooltip';
import { useState } from 'react';

export function PlayTimeBarChart({ data }) {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          onMouseMove={(state) => {
            if (state && state.activeTooltipIndex !== undefined) {
              setActiveIndex(state.activeTooltipIndex);
            } else {
              setActiveIndex(null);
            }
          }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
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
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.4)' }} />
          <Bar 
            dataKey="matches" 
            name="Số trận"
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
            onClick={(data, index) => {
              // Interactive drill down placeholder
              console.log('Drill down into:', data);
            }}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={activeIndex === index ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.7)'}
                className="transition-colors duration-300 cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
