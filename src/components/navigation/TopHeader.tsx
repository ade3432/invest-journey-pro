import { StreakCounter } from "@/components/gamification/StreakCounter";
import { HeartsDisplay } from "@/components/gamification/HeartsDisplay";
import { CoinDisplay } from "@/components/gamification/CoinDisplay";
import { BullMascot } from "@/components/mascot/BullMascot";

interface TopHeaderProps {
  streak: number;
  hearts: number;
  coins: number;
  isPremium?: boolean;
}

export function TopHeader({ streak, hearts, coins, isPremium = false }: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 pt-safe">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-1.5">
          <BullMascot size="sm" mood="happy" animate={false} />
          <span className="font-bold text-lg text-foreground">TradeQuest</span>
        </div>
        <div className="flex items-center gap-2">
          <StreakCounter streak={streak} />
          <HeartsDisplay hearts={hearts} isPremium={isPremium} />
          <CoinDisplay coins={coins} />
        </div>
      </div>
    </header>
  );
}
