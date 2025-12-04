import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: "primary" | "xp" | "streak" | "hearts" | "coin" | "accent";
  className?: string;
}

export function StatCard({ icon, label, value, color = "primary", className }: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    xp: "bg-xp/10 text-xp",
    streak: "bg-streak/10 text-streak",
    hearts: "bg-hearts/10 text-hearts",
    coin: "bg-coin/10 text-coin",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <div className={cn("bg-card rounded-2xl p-4 border border-border", className)}>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", colorClasses[color])}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
