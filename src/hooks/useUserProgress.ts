import { useState, useEffect } from "react";

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
  favorites: string[];
}

const DEFAULT_PROGRESS: UserProgress = {
  xp: 1250,
  xpToNextLevel: 2000,
  level: 7,
  streak: 12,
  hearts: 4,
  coins: 850,
  lessonsCompleted: 47,
  dailyGoal: 3,
  dailyProgress: 2,
  favorites: ["bitcoin", "ethereum"],
};

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem("tradeup-progress");
    return saved ? JSON.parse(saved) : DEFAULT_PROGRESS;
  });

  useEffect(() => {
    localStorage.setItem("tradeup-progress", JSON.stringify(progress));
  }, [progress]);

  const addXP = (amount: number) => {
    setProgress((prev) => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNextLevel;

      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel += 1;
        newXpToNext = Math.floor(newXpToNext * 1.2);
      }

      return { ...prev, xp: newXp, level: newLevel, xpToNextLevel: newXpToNext };
    });
  };

  const loseHeart = () => {
    setProgress((prev) => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1),
    }));
  };

  const toggleFavorite = (coinId: string) => {
    setProgress((prev) => ({
      ...prev,
      favorites: prev.favorites.includes(coinId)
        ? prev.favorites.filter((id) => id !== coinId)
        : [...prev.favorites, coinId],
    }));
  };

  const incrementDailyProgress = () => {
    setProgress((prev) => ({
      ...prev,
      dailyProgress: Math.min(prev.dailyProgress + 1, prev.dailyGoal),
      lessonsCompleted: prev.lessonsCompleted + 1,
    }));
  };

  return {
    progress,
    addXP,
    loseHeart,
    toggleFavorite,
    incrementDailyProgress,
  };
}
