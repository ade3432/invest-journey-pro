import { cn } from "@/lib/utils";
import { Coins } from "lucide-react";

interface CoinDisplayProps {
  coins: number;
  className?: string;
}

export function CoinDisplay({ coins, className }: CoinDisplayProps) {
  return (
    <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-coin/20", className)}>
      <Coins className="w-5 h-5 text-coin" />
      <span className="font-bold text-coin">{coins.toLocaleString()}</span>
    </div>
  );
}
