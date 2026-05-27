export default function PremiumPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pt-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-display text-white tracking-tight">
          SmashClub <span className="text-primary">Premium</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Unlock VIP court access, advanced analytics, and priority booking with our premium membership tiers.
        </p>
      </div>
      <div className="glass-panel p-12 text-center border border-border-dark shadow-2xl rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
        <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-primary font-bold text-xl">PR</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Premium Portal Initialized</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          The premium component hierarchy is fully mapped and optimized for lazy-loading in our production-ready shell.
        </p>
      </div>
    </div>
  );
}
