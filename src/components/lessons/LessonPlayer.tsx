import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { MultipleChoice, TrueFalse, FillBlank, SwipeCard } from "./QuestionTypes";
import { PatternRecognition, PatternNaming } from "./PatternRecognition";
import { PatternKey } from "./CandlestickChart";
import { X, Heart, Star, Coins, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'swipe' | 'pattern_recognition' | 'pattern_naming';
  question?: string;
  statement?: string;
  sentence?: string;
  scenario?: string;
  options?: string[];
  correctIndex?: number;
  isTrue?: boolean;
  answer?: string;
  isBullish?: boolean;
  patternKey?: PatternKey;
  showPatternName?: boolean;
}

interface LessonPlayerProps {
  lessonTitle: string;
  questions: Question[];
  xpReward: number;
  coinReward: number;
  hearts: number;
  onComplete: (correct: number, total: number) => void;
  onClose: () => void;
  onLoseHeart: () => void;
}

export default function LessonPlayer({
  lessonTitle,
  questions,
  xpReward,
  coinReward,
  hearts,
  onComplete,
  onClose,
  onLoseHeart,
}: LessonPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentHearts, setCurrentHearts] = useState(hearts);

  const progress = ((currentIndex) / questions.length) * 100;
  const currentQuestion = questions[currentIndex];

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
    // No longer lose hearts or kick out on wrong answers

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setIsComplete(true);
        onComplete(correct ? correctAnswers + 1 : correctAnswers, questions.length);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, 1000);
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <MultipleChoice
            question={currentQuestion.question!}
            options={currentQuestion.options!}
            correctIndex={currentQuestion.correctIndex!}
            onAnswer={handleAnswer}
          />
        );
      case 'true_false':
        return (
          <TrueFalse
            statement={currentQuestion.statement!}
            isTrue={currentQuestion.isTrue!}
            onAnswer={handleAnswer}
          />
        );
      case 'fill_blank':
        return (
          <FillBlank
            sentence={currentQuestion.sentence!}
            answer={currentQuestion.answer!}
            onAnswer={handleAnswer}
          />
        );
      case 'swipe':
        return (
          <SwipeCard
            scenario={currentQuestion.scenario!}
            isBullish={currentQuestion.isBullish!}
            onAnswer={handleAnswer}
          />
        );
      case 'pattern_recognition':
        return (
          <PatternRecognition
            patternKey={currentQuestion.patternKey!}
            showPatternName={currentQuestion.showPatternName}
            onAnswer={handleAnswer}
          />
        );
      case 'pattern_naming':
        return (
          <PatternNaming
            patternKey={currentQuestion.patternKey!}
            options={currentQuestion.options!}
            onAnswer={handleAnswer}
          />
        );
      default:
        return null;
    }
  };

  if (isComplete) {
    const passed = correctAnswers >= questions.length * 0.7;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50">
          <CardContent className="p-8 text-center space-y-6">
            <div className={cn(
              "w-20 h-20 rounded-full mx-auto flex items-center justify-center",
              passed ? "bg-green-500/20" : "bg-red-500/20"
            )}>
              {passed ? (
                <PartyPopper className="w-10 h-10 text-green-500" />
              ) : (
                <X className="w-10 h-10 text-red-500" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {passed ? "Lesson Complete!" : "Keep Practicing!"}
              </h2>
              <p className="text-muted-foreground">
                You got {correctAnswers} out of {questions.length} correct
              </p>
            </div>
            {passed && (
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-1">
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                  <p className="font-bold">+{xpReward}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-1">
                    <Coins className="w-6 h-6 text-amber-500" />
                  </div>
                  <p className="font-bold">+{coinReward}</p>
                  <p className="text-xs text-muted-foreground">Coins</p>
                </div>
              </div>
            )}
            <Button className="w-full" onClick={onClose}>
              {passed ? "Continue" : "Try Again"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">{lessonTitle}</h1>
          <div className="flex items-center gap-1">
            <Heart className={cn("w-5 h-5", currentHearts > 0 ? "text-red-500 fill-red-500" : "text-muted")} />
            <span className="font-bold">{currentHearts}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {renderQuestion()}
        </div>
      </div>
    </div>
  );
}
