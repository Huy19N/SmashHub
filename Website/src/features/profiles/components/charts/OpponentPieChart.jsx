import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartTooltip } from '../../../../components/ui/ChartTooltip';
import { useState } from 'react';

export function OpponentPieChart({ data }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="h-[300px] w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip />} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1500}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                className="transition-opacity duration-300 cursor-pointer hover:drop-shadow-lg"
              />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
