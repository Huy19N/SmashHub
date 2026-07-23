import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { ChartTooltip } from '../../../../components/ui/ChartTooltip';

export function FeedbackRatingChart({ data }) {
  const defaultFeedbackData = [
    { rating: 'Rất tốt', count: 18, color: '#0BE860' },
    { rating: 'Tốt', count: 5, color: '#3b82f6' },
    { rating: 'Trung bình', count: 1, color: '#f59e0b' },
    { rating: 'Kém', count: 1, color: '#ef4444' }
  ];

  const chartData = data && data.length > 0 ? data : defaultFeedbackData;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 25, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis 
            dataKey="rating" 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} 
            tickLine={false} 
            axisLine={{ stroke: '#334155' }} 
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            tickLine={false} 
            axisLine={false} 
            domain={[0, 25]}
            ticks={[0, 5, 10, 15, 20, 25]}
          />
          <Tooltip 
            content={<ChartTooltip />} 
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
          <Bar 
            dataKey="count" 
            name="Số lượng phản hồi" 
            radius={[8, 8, 0, 0]} 
            barSize={52}
            animationDuration={1500}
          >
            <LabelList 
              dataKey="count" 
              position="top" 
              fill="#ffffff" 
              fontSize={13} 
              fontWeight="bold" 
              dy={-6}
            />
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || '#0BE860'} 
                className="transition-opacity duration-300 hover:opacity-85"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
