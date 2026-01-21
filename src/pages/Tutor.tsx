import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Bot, User, Sparkles, Crown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopHeader } from "@/components/navigation/TopHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useCloudProgress } from "@/hooks/useCloudProgress";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useInAppPurchases } from "@/hooks/useInAppPurchases";
import { PremiumModal } from "@/components/premium/PremiumModal";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;

const quickQuestions = [
  "What is a stop-loss?",
  "Explain RSI indicator",
  "How do I read candlesticks?",
  "What is market cap?",
  "Explain support and resistance",
  "What is dollar-cost averaging?",
];

export default function Tutor() {
  const { user } = useAuth();
  const { progress: cloudProgress } = useCloudProgress();
  const { progress: localProgress } = useUserProgress();
  const progress = user ? cloudProgress : localProgress;
  const { isPremium, isLoading: isPremiumLoading } = useInAppPurchases();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to start stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => 
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Show premium paywall if not premium
  if (!isPremiumLoading && !isPremium) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-24">
        <TopHeader 
          streak={progress.streak} 
          hearts={progress.hearts} 
          coins={progress.coins} 
        />
        
        <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full px-4">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <div className="relative">
                <Sparkles className="w-10 h-10 text-primary" />
                <Lock className="w-5 h-5 absolute -bottom-1 -right-1 text-amber-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">AI Trading Tutor</h1>
              <p className="text-muted-foreground">
                Get personalized trading education from your AI tutor. Ask questions, learn strategies, and master the markets.
              </p>
            </div>

            <div className="bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 justify-center">
                <Crown className="w-5 h-5 text-amber-500" />
                <span className="font-semibold">Premium Feature</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Unlock the AI Tutor and all premium features with a subscription.
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                onClick={() => setShowPremiumModal(true)}
              >
                <Crown className="w-4 h-4 mr-2" />
                Unlock Premium
              </Button>
            </div>
          </div>
        </div>

        <PremiumModal open={showPremiumModal} onOpenChange={setShowPremiumModal} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <TopHeader 
        streak={progress.streak} 
        hearts={progress.hearts} 
        coins={progress.coins} 
      />
      
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-xl">AI Trading Tutor</h1>
              <p className="text-sm text-muted-foreground">Ask me anything about trading</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="space-y-6">
              <p className="text-muted-foreground text-center">
                Hi! I'm your AI trading tutor. Ask me anything about stocks, crypto, or trading strategies.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground font-medium">Quick questions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickQuestions.map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-auto py-3 px-3"
                      onClick={() => sendMessage(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about trading..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
