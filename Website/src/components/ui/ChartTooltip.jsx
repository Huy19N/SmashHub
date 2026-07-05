export function ChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm text-card-foreground p-3 rounded-lg shadow-xl border border-border/50 text-sm transition-all duration-300">
        <p className="font-semibold mb-2 text-primary">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: entry.color || entry.payload.fill || 'var(--color-primary)' }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-semibold text-foreground tracking-tight">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}
