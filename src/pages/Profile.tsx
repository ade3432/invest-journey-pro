import { useNavigate, useSearchParams } from "react-router-dom";
import { TopHeader } from "@/components/navigation/TopHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useCloudProgress } from "@/hooks/useCloudProgress";
import { useUserProgress } from "@/hooks/useUserProgress";
import { StatCard } from "@/components/profile/StatCard";
import { AchievementBadge } from "@/components/profile/AchievementBadge";
import { BullMascot } from "@/components/mascot/BullMascot";
import { Zap, Flame, BookOpen, Target, Settings, Moon, Sun, LogOut, LogIn, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const achievements = [
  { icon: "🎯", name: "First Steps", description: "Complete your first lesson", isUnlocked: true },
  { icon: "🔥", name: "7-Day Streak", description: "Learn 7 days in a row", isUnlocked: true },
  { icon: "📊", name: "Chart Master", description: "Complete Reading Charts module", isUnlocked: true },
  { icon: "💎", name: "Diamond Hands", description: "Reach Gold League", isUnlocked: false },
  { icon: "🚀", name: "To The Moon", description: "Earn 10,000 XP", isUnlocked: false },
  { icon: "🧠", name: "Big Brain", description: "100% accuracy in a quiz", isUnlocked: false },
];

const Profile = () => {
  const { user, signOut } = useAuth();
  const { progress: cloudProgress } = useCloudProgress();
  const { progress: localProgress } = useUserProgress();
  const progress = user ? cloudProgress : localProgress;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [isDark, setIsDark] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
    
    // Check for payment success/cancel
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast({
        title: "Payment successful! 🎉",
        description: "Welcome to Premium! Enjoy all features.",
      });
    } else if (paymentStatus === "canceled") {
      toast({
        title: "Payment canceled",
        description: "Your payment was not completed.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
  };

  const handlePurchasePremium = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setIsPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const levelTitle = progress.level < 5 
    ? "Beginner Trader" 
    : progress.level < 10 
    ? "Market Learner" 
    : progress.level < 15 
    ? "Chart Analyst" 
    : "Trading Guru";

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopHeader
        streak={progress.streak}
        hearts={progress.hearts}
        coins={progress.coins}
      />

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-8 animate-fade-in">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <BullMascot size="lg" mood="celebrate" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-sm font-bold">
              Lv.{progress.level}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {user?.email?.split('@')[0] || 'Trader'}
          </h1>
          <p className="text-muted-foreground font-semibold">{levelTitle}</p>
          {user && (
            <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
          )}
        </div>

        {/* Auth Actions */}
        {!user ? (
          <Button 
            className="w-full mb-4" 
            onClick={() => navigate('/auth')}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In to Save Progress
          </Button>
        ) : null}

        {/* Premium Purchase */}
        <div className="bg-gradient-to-r from-warning/20 to-primary/20 rounded-2xl p-4 mb-6 border border-warning/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Go Premium</h3>
              <p className="text-sm text-muted-foreground">Unlock all features for $10</p>
            </div>
          </div>
          <Button 
            className="w-full bg-warning hover:bg-warning/90 text-warning-foreground"
            onClick={handlePurchasePremium}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Crown className="w-4 h-4 mr-2" />
            )}
            {isPurchasing ? "Processing..." : "Upgrade Now - $10"}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <StatCard
            icon={<Zap className="w-5 h-5" />}
            label="Total XP"
            value={progress.xp.toLocaleString()}
            color="xp"
          />
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            label="Day Streak"
            value={progress.streak}
            color="streak"
          />
          <StatCard
            icon={<BookOpen className="w-5 h-5" />}
            label="Lessons"
            value={progress.lessonsCompleted}
            color="primary"
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Accuracy"
            value="87%"
            color="accent"
          />
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Achievements</h2>
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div
                key={achievement.name}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <AchievementBadge {...achievement} />
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
              <div className="flex items-center gap-3">
                {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <span className="font-semibold">Dark Mode</span>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-12 h-7 rounded-full transition-colors ${
                  isDark ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-card shadow-md transform transition-transform ${
                    isDark ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <Button variant="outline" className="w-full justify-start">
              Daily Goal: {progress.dailyGoal} lessons
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              Notifications
            </Button>

            {user && (
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
