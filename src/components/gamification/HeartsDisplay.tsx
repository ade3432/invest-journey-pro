import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

interface HeartsDisplayProps {
  hearts: number;
  maxHearts?: number;
  className?: string;
}

export function HeartsDisplay({ hearts, maxHearts = 5, className }: HeartsDisplayProps) {
  return (
    <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-hearts/20", className)}>
      <Heart className="w-5 h-5 text-hearts fill-hearts" />
      <span className="font-bold text-hearts">{hearts}</span>
    </div>
  );
}
