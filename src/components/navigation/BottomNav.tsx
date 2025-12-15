import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { BookOpen, Target, TrendingUp, MessageCircle, User } from "lucide-react";

const navItems = [
  { to: "/", icon: BookOpen, label: "Learn" },
  { to: "/practice", icon: Target, label: "Practice" },
  { to: "/market", icon: TrendingUp, label: "Market" },
  { to: "/tutor", icon: MessageCircle, label: "AI Tutor" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 bg-card border border-border safe-bottom rounded-3xl shadow-lg">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <div className={cn(
                  "p-2 rounded-xl transition-all",
                  isActive && "bg-primary/10"
                )}>
                  <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                </div>
                <span className="text-xs font-semibold">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
