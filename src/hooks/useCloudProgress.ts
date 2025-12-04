import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserProgress {
  xp: number;
  xpToNextLevel: number;
  level: number;
  streak: number;
  hearts: number;
  coins: number;
  lessonsCompleted: number;
  dailyGoal: number;
  dailyProgress: number;
}

const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  xpToNextLevel: 2000,
  level: 1,
  streak: 0,
  hearts: 5,
  coins: 0,
  lessonsCompleted: 0,
  dailyGoal: 3,
  dailyProgress: 0,
};

export function useCloudProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress(DEFAULT_PROGRESS);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProgress({
          xp: data.xp,
          xpToNextLevel: data.xp_to_next_level,
          level: data.level,
          streak: data.streak,
          hearts: data.hearts,
          coins: data.coins,
          lessonsCompleted: data.lessons_completed,
          dailyGoal: data.daily_goal,
          dailyProgress: data.daily_progress,
        });
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const updateProgress = async (updates: Partial<UserProgress>) => {
    if (!user) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
    if (updates.xpToNextLevel !== undefined) dbUpdates.xp_to_next_level = updates.xpToNextLevel;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
    if (updates.hearts !== undefined) dbUpdates.hearts = updates.hearts;
    if (updates.coins !== undefined) dbUpdates.coins = updates.coins;
    if (updates.lessonsCompleted !== undefined) dbUpdates.lessons_completed = updates.lessonsCompleted;
    if (updates.dailyGoal !== undefined) dbUpdates.daily_goal = updates.dailyGoal;
    if (updates.dailyProgress !== undefined) dbUpdates.daily_progress = updates.dailyProgress;

    try {
      const { error } = await supabase
        .from('user_progress')
        .update(dbUpdates)
        .eq('user_id', user.id);

      if (error) throw error;

      setProgress(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const addXP = async (amount: number) => {
    let newXp = progress.xp + amount;
    let newLevel = progress.level;
    let newXpToNext = progress.xpToNextLevel;

    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel += 1;
      newXpToNext = Math.floor(newXpToNext * 1.2);
    }

    await updateProgress({
      xp: newXp,
      level: newLevel,
      xpToNextLevel: newXpToNext,
    });
  };

  const loseHeart = async () => {
    await updateProgress({
      hearts: Math.max(0, progress.hearts - 1),
    });
  };

  const addCoins = async (amount: number) => {
    await updateProgress({
      coins: progress.coins + amount,
    });
  };

  const incrementDailyProgress = async () => {
    await updateProgress({
      dailyProgress: Math.min(progress.dailyProgress + 1, progress.dailyGoal),
      lessonsCompleted: progress.lessonsCompleted + 1,
    });
  };

  const refillHearts = async () => {
    if (progress.coins >= 50) {
      await updateProgress({
        hearts: 5,
        coins: progress.coins - 50,
      });
    }
  };

  return {
    progress,
    loading,
    addXP,
    loseHeart,
    addCoins,
    incrementDailyProgress,
    refillHearts,
    refreshProgress: fetchProgress,
  };
}
