import { Trophy, Activity, Swords, Dumbbell, Flame } from 'lucide-react';

export default function SportyWatermarks() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <Trophy className="absolute -top-12 -left-12 w-64 h-64 text-emerald-500/[0.03] dark:text-primary/[0.015] transform -rotate-12" />
      <Activity className="absolute -bottom-16 -right-16 w-80 h-80 text-emerald-500/[0.03] dark:text-primary/[0.015] transform rotate-12" />
      <Swords className="absolute top-1/3 left-1/4 w-52 h-52 text-emerald-500/[0.02] dark:text-primary/[0.01] transform rotate-45" />
      <Dumbbell className="absolute bottom-1/3 right-1/3 w-48 h-48 text-emerald-500/[0.02] dark:text-primary/[0.01] transform -rotate-12" />
      <Flame className="absolute top-12 right-12 w-44 h-44 text-orange-500/[0.02] dark:text-orange-500/[0.01] transform rotate-12" />
    </div>
  );
}
