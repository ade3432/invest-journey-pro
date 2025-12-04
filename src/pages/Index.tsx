import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopHeader } from "@/components/navigation/TopHeader";
import { XPBar } from "@/components/gamification/XPBar";
import { DailyGoal } from "@/components/learn/DailyGoal";
import { BullMascot } from "@/components/mascot/BullMascot";
import { useAuth } from "@/contexts/AuthContext";
import { useCloudProgress } from "@/hooks/useCloudProgress";
import { useUserProgress } from "@/hooks/useUserProgress";
import { supabase } from "@/integrations/supabase/client";
import LessonCard from "@/components/lessons/LessonCard";
import LessonPlayer from "@/components/lessons/LessonPlayer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Loader2 } from "lucide-react";

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  difficulty: string;
  xp_reward: number;
  coin_reward: number;
  order_index: number;
  content: unknown;
}

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { progress: cloudProgress, loading: progressLoading, addXP, addCoins, loseHeart, incrementDailyProgress } = useCloudProgress();
  const { progress: localProgress } = useUserProgress();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [showWelcome, setShowWelcome] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Use cloud progress if logged in, otherwise local
  const progress = user ? cloudProgress : localProgress;

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .order('module_id')
          .order('order_index');
        
        if (error) throw error;
        setLessons(data || []);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLessonsLoading(false);
      }
    };

    const fetchCompletedLessons = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('completed', true);
        
        if (error) throw error;
        setCompletedLessons(data?.map(l => l.lesson_id) || []);
      } catch (error) {
        console.error('Error fetching completed lessons:', error);
      }
    };

    fetchLessons();
    fetchCompletedLessons();
  }, [user]);

  const handleLessonComplete = async (correct: number, total: number) => {
    if (!activeLesson || !user) {
      setActiveLesson(null);
      return;
    }

    const passed = correct >= total * 0.7;
    
    if (passed) {
      await addXP(activeLesson.xp_reward);
      await addCoins(activeLesson.coin_reward);
      await incrementDailyProgress();
      
      // Mark lesson as complete
      await supabase.from('lesson_progress').upsert({
        user_id: user.id,
        lesson_id: activeLesson.id,
        completed: true,
        score: Math.round((correct / total) * 100),
        completed_at: new Date().toISOString(),
      });
      
      setCompletedLessons(prev => [...prev, activeLesson.id]);
      
      toast({
        title: "Lesson Complete!",
        description: `+${activeLesson.xp_reward} XP, +${activeLesson.coin_reward} coins`,
      });
    }
    
    setActiveLesson(null);
  };

  const handleStartLesson = (lesson: Lesson) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to start lessons",
      });
      navigate('/auth');
      return;
    }
    setActiveLesson(lesson);
  };

  // Group lessons by module
  const lessonsByModule = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.module_id]) acc[lesson.module_id] = [];
    acc[lesson.module_id].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  const moduleNames: Record<string, string> = {
    basics: "Trading Basics",
    crypto: "Crypto Fundamentals",
    technical: "Technical Analysis",
  };

  if (activeLesson) {
    return (
      <LessonPlayer
        lessonTitle={activeLesson.title}
        questions={activeLesson.content as any}
        xpReward={activeLesson.xp_reward}
        coinReward={activeLesson.coin_reward}
        hearts={progress.hearts}
        onComplete={handleLessonComplete}
        onClose={() => setActiveLesson(null)}
        onLoseHeart={user ? loseHeart : () => {}}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopHeader 
        streak={progress.streak} 
        hearts={progress.hearts} 
        coins={progress.coins} 
      />
      
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Auth Banner */}
        {!user && !authLoading && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-semibold">Sign in to save progress</p>
              <p className="text-sm text-muted-foreground">Sync across devices</p>
            </div>
            <Button onClick={() => navigate('/auth')} size="sm">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
        )}

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
                  {user ? `Welcome back! 🚀` : 'Start Learning! 🚀'}
                </h2>
                <p className="text-muted-foreground text-sm mb-3">
                  {progress.streak > 0 
                    ? `You're on a ${progress.streak} day streak! Keep it going.`
                    : 'Begin your trading education journey.'}
                </p>
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

        {/* Lessons */}
        <div className="space-y-6">
          {lessonsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : Object.entries(lessonsByModule).length > 0 ? (
            Object.entries(lessonsByModule).map(([moduleId, moduleLessons]) => (
              <div key={moduleId}>
                <h2 className="text-lg font-bold mb-3">{moduleNames[moduleId] || moduleId}</h2>
                <div className="space-y-3">
                  {moduleLessons.map((lesson, idx) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const isLocked = idx > 0 && !completedLessons.includes(moduleLessons[idx - 1].id) && !isCompleted;
                    
                    return (
                      <LessonCard
                        key={lesson.id}
                        title={lesson.title}
                        description={lesson.description || ''}
                        difficulty={lesson.difficulty}
                        xpReward={lesson.xp_reward}
                        coinReward={lesson.coin_reward}
                        isCompleted={isCompleted}
                        isLocked={isLocked}
                        onClick={() => handleStartLesson(lesson)}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No lessons available yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
