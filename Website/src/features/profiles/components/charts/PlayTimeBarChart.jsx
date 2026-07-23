import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartTooltip } from '../../../../components/ui/ChartTooltip';
import { useState } from 'react';

export function PlayTimeBarChart({ data = [] }) {
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis 
            dataKey="name" 
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
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
          <Bar 
            dataKey="matches" 
            name="Số trận"
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={activeIndex === index ? '#0BE860' : 'rgba(11, 232, 96, 0.7)'}
                className="transition-colors duration-300 cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
