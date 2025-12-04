import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
        outline: "border-2 border-border bg-background hover:bg-muted hover:border-primary/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-md shadow-success/30",
        xp: "bg-xp text-xp-foreground hover:bg-xp/90 shadow-md shadow-xp/30",
        streak: "bg-streak text-streak-foreground hover:bg-streak/90 shadow-md shadow-streak/30",
        coin: "bg-coin text-coin-foreground hover:bg-coin/90 shadow-md shadow-coin/30",
        game: "bg-primary text-primary-foreground shadow-[0_6px_0_0_hsl(var(--primary)/0.7)] hover:shadow-[0_4px_0_0_hsl(var(--primary)/0.7)] hover:translate-y-0.5 active:shadow-[0_0px_0_0_hsl(var(--primary)/0.7)] active:translate-y-1.5",
        "game-secondary": "bg-muted text-foreground border-2 border-border shadow-[0_6px_0_0_hsl(var(--border))] hover:shadow-[0_4px_0_0_hsl(var(--border))] hover:translate-y-0.5 active:shadow-[0_0px_0_0_hsl(var(--border))] active:translate-y-1.5",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-13 rounded-2xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
