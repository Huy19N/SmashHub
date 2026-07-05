import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/95 backdrop-blur-sm text-card-foreground p-3 rounded-lg shadow-xl border border-border/50 text-sm">
        <p className="font-semibold mb-1 text-primary">{`${data.day} - ${data.hour}`}</p>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Tỉ lệ lấp đầy:</span>
          <span className="font-bold text-foreground">{data.value}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export function UtilizationHeatmap({ data }) {
  // Color scale function for heatmap
  const getColor = (value) => {
    if (value < 20) return 'hsl(var(--primary)/0.1)';
    if (value < 40) return 'hsl(var(--primary)/0.3)';
    if (value < 60) return 'hsl(var(--primary)/0.5)';
    if (value < 80) return 'hsl(var(--primary)/0.7)';
    return 'hsl(var(--primary))';
  };

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            type="category" 
            dataKey="day" 
            name="Ngày" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            type="category" 
            dataKey="hour" 
            name="Giờ" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
          />
          <ZAxis type="number" dataKey="value" range={[400, 400]} name="Lấp đầy" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={data} shape="square" animationDuration={1500}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.value)} className="transition-colors duration-300 hover:opacity-80" />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
