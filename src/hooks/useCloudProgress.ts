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
  lastHeartUpdate: string | null;
}

const MAX_HEARTS = 5;
const HEART_REFILL_INTERVAL_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const HEARTS_REFILL_COST = 250;

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
  lastHeartUpdate: null,
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
        // Calculate hearts to refill based on time elapsed
        const lastUpdate = data.last_heart_update ? new Date(data.last_heart_update) : new Date();
        const now = new Date();
        const elapsedMs = now.getTime() - lastUpdate.getTime();
        const heartsToRefill = Math.floor(elapsedMs / HEART_REFILL_INTERVAL_MS);
        
        let currentHearts = data.hearts;
        let needsUpdate = false;
        
        if (heartsToRefill > 0 && currentHearts < MAX_HEARTS) {
          currentHearts = Math.min(MAX_HEARTS, currentHearts + heartsToRefill);
          needsUpdate = true;
        }
        
        // Update database if hearts were refilled
        if (needsUpdate) {
          await supabase
            .from('user_progress')
            .update({ 
              hearts: currentHearts, 
              last_heart_update: now.toISOString() 
            })
            .eq('user_id', user.id);
        }
        
        setProgress({
          xp: data.xp,
          xpToNextLevel: data.xp_to_next_level,
          level: data.level,
          streak: data.streak,
          hearts: currentHearts,
          coins: data.coins,
          lessonsCompleted: data.lessons_completed,
          dailyGoal: data.daily_goal,
          dailyProgress: data.daily_progress,
          lastHeartUpdate: now.toISOString(),
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
    if (updates.hearts !== undefined) {
      dbUpdates.hearts = updates.hearts;
      dbUpdates.last_heart_update = new Date().toISOString();
    }
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
    if (progress.hearts > 0) {
      await updateProgress({
        hearts: progress.hearts - 1,
      });
    }
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

  const buyHearts = async (): Promise<boolean> => {
    if (progress.coins >= HEARTS_REFILL_COST && progress.hearts < MAX_HEARTS) {
      await updateProgress({
        hearts: MAX_HEARTS,
        coins: progress.coins - HEARTS_REFILL_COST,
      });
      return true;
    }
    return false;
  };

  const getTimeUntilNextHeart = (): number | null => {
    if (progress.hearts >= MAX_HEARTS) return null;
    if (!progress.lastHeartUpdate) return HEART_REFILL_INTERVAL_MS;
    
    const lastUpdate = new Date(progress.lastHeartUpdate);
    const now = new Date();
    const elapsed = now.getTime() - lastUpdate.getTime();
    const remaining = HEART_REFILL_INTERVAL_MS - (elapsed % HEART_REFILL_INTERVAL_MS);
    return remaining;
  };

  return {
    progress,
    loading,
    addXP,
    loseHeart,
    addCoins,
    incrementDailyProgress,
    buyHearts,
    getTimeUntilNextHeart,
    refreshProgress: fetchProgress,
    MAX_HEARTS,
    HEARTS_REFILL_COST,
  };
}
