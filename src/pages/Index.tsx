import { useState } from "react";
import { TopHeader } from "@/components/navigation/TopHeader";
import { XPBar } from "@/components/gamification/XPBar";
import { DailyGoal } from "@/components/learn/DailyGoal";
import { SkillPath } from "@/components/learn/SkillPath";
import { BullMascot } from "@/components/mascot/BullMascot";
import { useUserProgress } from "@/hooks/useUserProgress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { progress, addXP, incrementDailyProgress } = useUserProgress();
  const { toast } = useToast();
  const [showWelcome, setShowWelcome] = useState(true);

  const handleModuleClick = (moduleId: string) => {
    toast({
      title: "Starting lesson...",
      description: `Loading ${moduleId} module`,
    });
    // In a real app, this would navigate to the lesson
    addXP(50);
    incrementDailyProgress();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopHeader 
        streak={progress.streak} 
        hearts={progress.hearts} 
        coins={progress.coins} 
      />
      
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* XP Progress */}
        <XPBar 
          current={progress.xp} 
          max={progress.xpToNextLevel} 
          level={progress.level}
          className="mb-6"
        />

        {/* Welcome Banner */}
        {showWelcome && (
          <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-6 mb-6 overflow-hidden animate-fade-in">
            <button 
              onClick={() => setShowWelcome(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
            <div className="flex items-center gap-4">
              <BullMascot size="lg" mood="excited" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  Welcome back! 🚀
                </h2>
                <p className="text-muted-foreground text-sm mb-3">
                  You're on a {progress.streak} day streak! Keep it going.
                </p>
                <Button variant="game" size="sm">
                  Continue Learning
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Daily Goal */}
        <DailyGoal 
          completed={progress.dailyProgress} 
          goal={progress.dailyGoal}
          className="mb-6" 
        />

        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Your Learning Path</h2>
        </div>

        {/* Skill Tree */}
        <SkillPath onModuleClick={handleModuleClick} />
      </main>
    </div>
  );
};

export default Index;
