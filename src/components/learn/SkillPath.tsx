import { SkillNode } from "./SkillNode";
import { 
  Bitcoin, 
  LineChart, 
  Shield, 
  Brain, 
  Layers, 
  Image, 
  Settings2, 
  CandlestickChart 
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  icon: React.ReactNode;
  progress: number;
  isLocked: boolean;
}

const modules: Module[] = [
  { id: "crypto-101", title: "Crypto 101", icon: <Bitcoin className="w-8 h-8" />, progress: 5, isLocked: false },
  { id: "reading-charts", title: "Reading Charts", icon: <LineChart className="w-8 h-8" />, progress: 3, isLocked: false },
  { id: "trading-basics", title: "Trading Basics", icon: <CandlestickChart className="w-8 h-8" />, progress: 1, isLocked: false },
  { id: "risk-management", title: "Risk Management", icon: <Shield className="w-8 h-8" />, progress: 0, isLocked: false },
  { id: "trading-psychology", title: "Psychology", icon: <Brain className="w-8 h-8" />, progress: 0, isLocked: true },
  { id: "defi", title: "DeFi Basics", icon: <Layers className="w-8 h-8" />, progress: 0, isLocked: true },
  { id: "nfts", title: "NFTs Explained", icon: <Image className="w-8 h-8" />, progress: 0, isLocked: true },
  { id: "options", title: "Options Trading", icon: <Settings2 className="w-8 h-8" />, progress: 0, isLocked: true },
];

interface SkillPathProps {
  onModuleClick: (moduleId: string) => void;
}

export function SkillPath({ onModuleClick }: SkillPathProps) {
  // Find the first non-complete, non-locked module
  const activeModuleIndex = modules.findIndex(m => !m.isLocked && m.progress < 5);

  return (
    <div className="relative py-8">
      {/* Path line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-border -translate-x-1/2 rounded-full" />
      
      {/* Nodes */}
      <div className="relative flex flex-col items-center gap-8">
        {modules.map((module, index) => (
          <div 
            key={module.id}
            className={`animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <SkillNode
              title={module.title}
              icon={module.icon}
              progress={module.progress}
              isLocked={module.isLocked}
              isActive={index === activeModuleIndex}
              onClick={() => onModuleClick(module.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
