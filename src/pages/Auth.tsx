import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Mail, Lock, Loader2, ChevronRight, Sparkles, Target, Trophy } from "lucide-react";
import { z } from "zod";
import { BullMascot } from "@/components/mascot/BullMascot";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const onboardingSlides = [
  {
    icon: TrendingUp,
    title: "Learn Trading",
    description: "Master the markets with bite-sized lessons",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Target,
    title: "Practice Daily",
    description: "Build your skills with interactive challenges",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Trophy,
    title: "Compete & Win",
    description: "Challenge friends and climb the leaderboard",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!showAuth) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % onboardingSlides.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [showAuth]);

  const validateForm = () => {
    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "email") fieldErrors.email = err.message;
          if (err.path[0] === "password") fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message === "Invalid login credentials" 
          ? "Invalid email or password. Please try again."
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      navigate("/");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Account exists",
          description: "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Account created!",
        description: "Welcome to TradeUp! Start your trading journey.",
      });
      navigate("/");
    }
  };

  // Onboarding Screen
  if (!showAuth) {
    const slide = onboardingSlides[currentSlide];
    
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 pb-12 animate-fade-in">
        {/* Logo and mascot area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
          <div className="mb-8">
            <BullMascot size="lg" mood="happy" />
          </div>
          
          {/* Slide content */}
          <div className="text-center space-y-4 animate-fade-in" key={currentSlide}>
            <div className={`mx-auto w-16 h-16 ${slide.bgColor} rounded-2xl flex items-center justify-center`}>
              <slide.icon className={`w-8 h-8 ${slide.color}`} />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{slide.title}</h2>
            <p className="text-muted-foreground">{slide.description}</p>
          </div>
          
          {/* Slide indicators */}
          <div className="flex gap-2 mt-8">
            {onboardingSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? "w-8 bg-primary" 
                    : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="w-full max-w-sm space-y-3">
          <Button 
            onClick={() => { setShowAuth(true); setAuthMode("signup"); }}
            className="w-full h-14 text-lg rounded-2xl font-semibold"
          >
            Get Started
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            variant="ghost"
            onClick={() => { setShowAuth(true); setAuthMode("signin"); }}
            className="w-full h-12 text-muted-foreground"
          >
            I already have an account
          </Button>
        </div>
      </div>
    );
  }

  // Auth Form Screen
  return (
    <div className="min-h-screen bg-background flex flex-col p-6 animate-fade-in">
      {/* Header */}
      <button 
        onClick={() => setShowAuth(false)}
        className="text-muted-foreground mb-8"
      >
        ← Back
      </button>
      
      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm text-primary font-medium">TradeUp</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {authMode === "signin" ? "Welcome back!" : "Create account"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {authMode === "signin" 
              ? "Sign in to continue your trading journey" 
              : "Start your trading journey today"}
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={authMode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 rounded-2xl text-base bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            {errors.email && <p className="text-destructive text-sm pl-2">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder={authMode === "signup" ? "Password (min 6 characters)" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-14 rounded-2xl text-base bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            {errors.password && <p className="text-destructive text-sm pl-2">{errors.password}</p>}
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-14 text-lg rounded-2xl font-semibold mt-6" 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : authMode === "signin" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
        
        {/* Toggle auth mode */}
        <div className="mt-8 text-center">
          <span className="text-muted-foreground">
            {authMode === "signin" ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            type="button"
            onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
            className="text-primary font-semibold"
          >
            {authMode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
