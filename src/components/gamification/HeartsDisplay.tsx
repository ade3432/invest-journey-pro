import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Heart, Coins, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useCloudProgress } from "@/hooks/useCloudProgress";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface HeartsDisplayProps {
  hearts: number;
  maxHearts?: number;
  className?: string;
}

export function HeartsDisplay({ hearts, maxHearts = 5, className }: HeartsDisplayProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { progress, buyHearts, getTimeUntilNextHeart, MAX_HEARTS, HEARTS_REFILL_COST } = useCloudProgress();
  const [isBuyingHearts, setIsBuyingHearts] = useState(false);
  const [nextHeartTime, setNextHeartTime] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const remaining = getTimeUntilNextHeart();
      if (remaining === null) {
        setNextHeartTime(null);
      } else {
        const minutes = Math.ceil(remaining / 60000);
        setNextHeartTime(`${minutes}m`);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [getTimeUntilNextHeart, hearts]);

  const handleBuyHearts = async () => {
    if (!user) {
      setIsOpen(false);
      navigate('/auth');
      return;
    }
    
    if (hearts >= MAX_HEARTS) {
      toast({
        title: "Hearts Full",
        description: "You already have maximum hearts!",
      });
      return;
    }
    
    if (progress.coins < HEARTS_REFILL_COST) {
      toast({
        title: "Not Enough Coins",
        description: `You need ${HEARTS_REFILL_COST} coins to buy hearts.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsBuyingHearts(true);
    const success = await buyHearts();
    setIsBuyingHearts(false);
    
    if (success) {
      toast({
        title: "Hearts Refilled!",
        description: `You now have ${MAX_HEARTS} hearts.`,
      });
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-hearts/20 hover:bg-hearts/30 transition-colors cursor-pointer",
          className
        )}>
          <Heart className="w-5 h-5 text-hearts fill-hearts" />
          <span className="font-bold text-hearts">{hearts}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 bg-card border border-border shadow-lg z-50" align="center">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-foreground">Hearts</h4>
            <div className="flex items-center gap-1">
              {Array.from({ length: maxHearts }).map((_, i) => (
                <Heart 
                  key={i} 
                  className={`w-4 h-4 ${i < hearts ? 'text-hearts fill-hearts' : 'text-muted-foreground/30'}`} 
                />
              ))}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Hearts refill 1 per hour automatically.
          </p>
          
          {hearts < MAX_HEARTS && nextHeartTime && (
            <p className="text-sm text-muted-foreground">
              Next heart in: <span className="font-semibold text-foreground">{nextHeartTime}</span>
            </p>
          )}
          
          <Button 
            className="w-full"
            variant={hearts < MAX_HEARTS ? "default" : "outline"}
            onClick={handleBuyHearts}
            disabled={isBuyingHearts || hearts >= MAX_HEARTS}
            size="sm"
          >
            {isBuyingHearts ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Coins className="w-4 h-4 mr-2" />
            )}
            {hearts >= MAX_HEARTS 
              ? "Hearts Full" 
              : `Buy 5 Hearts - ${HEARTS_REFILL_COST} Coins`}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
