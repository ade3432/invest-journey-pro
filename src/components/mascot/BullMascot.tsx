import { cn } from "@/lib/utils";

interface BullMascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  mood?: "happy" | "excited" | "thinking" | "sad" | "celebrate";
  className?: string;
  animate?: boolean;
}

export function BullMascot({ 
  size = "md", 
  mood = "happy", 
  className,
  animate = true 
}: BullMascotProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-28 h-28",
    xl: "w-40 h-40",
  };

  const moodEmojis = {
    happy: "😊",
    excited: "🤩",
    thinking: "🤔",
    sad: "😢",
    celebrate: "🎉",
  };

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center",
        sizeClasses[size],
        animate && mood === "happy" && "animate-float",
        animate && mood === "excited" && "animate-wiggle",
        animate && mood === "celebrate" && "animate-bounce-in",
        className
      )}
    >
      {/* Bull body */}
      <div className="relative">
        {/* Main head */}
        <div className="relative bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg"
          style={{
            width: size === "sm" ? 40 : size === "md" ? 64 : size === "lg" ? 90 : 130,
            height: size === "sm" ? 40 : size === "md" ? 64 : size === "lg" ? 90 : 130,
          }}
        >
          {/* Horns */}
          <div className="absolute -top-1 left-1/4 transform -translate-x-1/2">
            <div 
              className="bg-gradient-to-t from-amber-600 to-amber-300 rounded-full transform -rotate-45"
              style={{
                width: size === "sm" ? 6 : size === "md" ? 10 : size === "lg" ? 14 : 20,
                height: size === "sm" ? 12 : size === "md" ? 20 : size === "lg" ? 28 : 40,
              }}
            />
          </div>
          <div className="absolute -top-1 right-1/4 transform translate-x-1/2">
            <div 
              className="bg-gradient-to-t from-amber-600 to-amber-300 rounded-full transform rotate-45"
              style={{
                width: size === "sm" ? 6 : size === "md" ? 10 : size === "lg" ? 14 : 20,
                height: size === "sm" ? 12 : size === "md" ? 20 : size === "lg" ? 28 : 40,
              }}
            />
          </div>
          
          {/* Ears */}
          <div className="absolute top-1 -left-1">
            <div 
              className="bg-amber-400 rounded-full"
              style={{
                width: size === "sm" ? 8 : size === "md" ? 12 : size === "lg" ? 16 : 24,
                height: size === "sm" ? 8 : size === "md" ? 12 : size === "lg" ? 16 : 24,
              }}
            />
          </div>
          <div className="absolute top-1 -right-1">
            <div 
              className="bg-amber-400 rounded-full"
              style={{
                width: size === "sm" ? 8 : size === "md" ? 12 : size === "lg" ? 16 : 24,
                height: size === "sm" ? 8 : size === "md" ? 12 : size === "lg" ? 16 : 24,
              }}
            />
          </div>

          {/* Face */}
          <div className="flex flex-col items-center justify-center">
            {/* Eyes */}
            <div className="flex gap-2 mb-1">
              <div 
                className="bg-foreground rounded-full flex items-center justify-center"
                style={{
                  width: size === "sm" ? 6 : size === "md" ? 10 : size === "lg" ? 14 : 20,
                  height: size === "sm" ? 6 : size === "md" ? 10 : size === "lg" ? 14 : 20,
                }}
              >
                <div 
                  className="bg-background rounded-full"
                  style={{
                    width: size === "sm" ? 2 : size === "md" ? 3 : size === "lg" ? 5 : 7,
                    height: size === "sm" ? 2 : size === "md" ? 3 : size === "lg" ? 5 : 7,
                  }}
                />
              </div>
              <div 
                className="bg-foreground rounded-full flex items-center justify-center"
                style={{
                  width: size === "sm" ? 6 : size === "md" ? 10 : size === "lg" ? 14 : 20,
                  height: size === "sm" ? 6 : size === "md" ? 10 : size === "lg" ? 14 : 20,
                }}
              >
                <div 
                  className="bg-background rounded-full"
                  style={{
                    width: size === "sm" ? 2 : size === "md" ? 3 : size === "lg" ? 5 : 7,
                    height: size === "sm" ? 2 : size === "md" ? 3 : size === "lg" ? 5 : 7,
                  }}
                />
              </div>
            </div>
            
            {/* Snout */}
            <div 
              className="bg-amber-200 rounded-full flex items-center justify-center"
              style={{
                width: size === "sm" ? 16 : size === "md" ? 26 : size === "lg" ? 36 : 52,
                height: size === "sm" ? 10 : size === "md" ? 16 : size === "lg" ? 22 : 32,
              }}
            >
              {/* Nostrils */}
              <div className="flex gap-1">
                <div 
                  className="bg-amber-400 rounded-full"
                  style={{
                    width: size === "sm" ? 3 : size === "md" ? 5 : size === "lg" ? 7 : 10,
                    height: size === "sm" ? 3 : size === "md" ? 5 : size === "lg" ? 7 : 10,
                  }}
                />
                <div 
                  className="bg-amber-400 rounded-full"
                  style={{
                    width: size === "sm" ? 3 : size === "md" ? 5 : size === "lg" ? 7 : 10,
                    height: size === "sm" ? 3 : size === "md" ? 5 : size === "lg" ? 7 : 10,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mood indicator */}
        {mood === "celebrate" && (
          <div className="absolute -top-2 -right-2 text-xl animate-bounce">
            ✨
          </div>
        )}
        {mood === "excited" && (
          <div className="absolute -top-1 -right-1 text-sm">
            💫
          </div>
        )}
      </div>
    </div>
  );
}
