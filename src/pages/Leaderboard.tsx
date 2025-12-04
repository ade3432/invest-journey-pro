import { TopHeader } from "@/components/navigation/TopHeader";
import { useUserProgress } from "@/hooks/useUserProgress";
import { Trophy, Medal, Crown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { BullMascot } from "@/components/mascot/BullMascot";

const leaderboardData = [
  { rank: 1, name: "CryptoKing", xp: 15420, avatar: "👑" },
  { rank: 2, name: "DiamondHands", xp: 14890, avatar: "💎" },
  { rank: 3, name: "MoonRider", xp: 13200, avatar: "🚀" },
  { rank: 4, name: "ChartMaster", xp: 12100, avatar: "📊" },
  { rank: 5, name: "BTCMaxi", xp: 11800, avatar: "₿" },
  { rank: 6, name: "DeFiDegen", xp: 10500, avatar: "🔥" },
  { rank: 7, name: "You", xp: 8950, avatar: "🐂", isUser: true },
  { rank: 8, name: "AltSeason", xp: 8200, avatar: "🌙" },
  { rank: 9, name: "HodlQueen", xp: 7800, avatar: "👸" },
  { rank: 10, name: "TradingNinja", xp: 7100, avatar: "🥷" },
];

const leagues = [
  { name: "Bronze", minXP: 0, icon: "🥉", color: "text-amber-600" },
  { name: "Silver", minXP: 5000, icon: "🥈", color: "text-slate-400" },
  { name: "Gold", minXP: 10000, icon: "🥇", color: "text-yellow-500" },
  { name: "Diamond", minXP: 20000, icon: "💎", color: "text-cyan-400" },
];

const Leaderboard = () => {
  const { progress } = useUserProgress();
  const currentLeague = leagues.filter((l) => progress.xp >= l.minXP).pop();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopHeader
        streak={progress.streak}
        hearts={progress.hearts}
        coins={progress.coins}
      />

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* League Banner */}
        <div className="bg-gradient-to-br from-coin/20 to-coin/5 rounded-3xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{currentLeague?.icon}</div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-semibold">Current League</p>
              <h2 className={cn("text-2xl font-bold", currentLeague?.color)}>
                {currentLeague?.name} League
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Top 10 advance to the next league
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold">
            <Trophy className="w-5 h-5" />
            Weekly
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-muted text-muted-foreground rounded-xl font-semibold hover:text-foreground transition-colors">
            <Users className="w-5 h-5" />
            Friends
          </button>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-2">
          {leaderboardData.map((user, index) => (
            <div
              key={user.rank}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border transition-all animate-fade-in",
                user.isUser
                  ? "bg-primary/10 border-primary/30"
                  : "bg-card border-border",
                user.rank <= 3 && "border-coin/30"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-10 flex items-center justify-center">
                {getRankIcon(user.rank)}
              </div>
              
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                {user.isUser ? <BullMascot size="sm" mood="happy" animate={false} /> : user.avatar}
              </div>

              <div className="flex-1">
                <h4 className={cn(
                  "font-bold",
                  user.isUser ? "text-primary" : "text-foreground"
                )}>
                  {user.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {user.xp.toLocaleString()} XP
                </p>
              </div>

              {user.rank <= 3 && (
                <div className="text-lg">
                  {user.rank === 1 ? "🏆" : user.rank === 2 ? "🥈" : "🥉"}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
