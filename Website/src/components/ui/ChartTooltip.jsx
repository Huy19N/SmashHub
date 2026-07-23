export function ChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-[#1e293b]/95 backdrop-blur-md text-white p-3 rounded-xl shadow-2xl border border-white/10 text-xs transition-all duration-300">
        <p className="font-bold mb-1.5 text-emerald-400 font-display">{label}</p>
        <div className="space-y-1 font-label">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0"
                style={{ backgroundColor: entry.color && !entry.color.includes('var') ? entry.color : (entry.payload?.fill && !entry.payload.fill.includes('var') ? entry.payload.fill : '#0BE860') }}
              />
              <span className="text-gray-300">{entry.name}:</span>
              <span className="font-extrabold text-white tracking-tight">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}
