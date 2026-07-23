import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { ChartTooltip } from '../../../../components/ui/ChartTooltip';

export function FeedbackRatingChart({ data = [] }) {
  const defaultData = [
    { name: 'Rất tốt', value: 18, color: '#0BE860' },
    { name: 'Tốt', value: 5, color: '#3b82f6' },
    { name: 'Trung bình', value: 2, color: '#f59e0b' },
    { name: 'Kém', value: 0, color: '#ef4444' },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 30, right: 20, left: -10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
            tickLine={false} 
            axisLine={{ stroke: '#334155' }}
            dy={8}
            label={{ value: 'Đánh giá', position: 'insideBottom', offset: -12, fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            tickLine={false} 
            axisLine={{ stroke: '#334155' }}
            domain={[0, 25]}
            label={{ value: 'Số lượng', angle: -90, position: 'insideLeft', offset: 15, fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
          <Bar 
            dataKey="value" 
            name="Số lượng" 
            radius={[8, 8, 0, 0]} 
            barSize={44}
            animationDuration={1500}
          >
            <LabelList dataKey="value" position="top" fill="#ffffff" fontSize={13} fontWeight="bold" dy={-6} />
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#0BE860'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
