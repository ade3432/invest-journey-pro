import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, X, ArrowLeft, ArrowRight } from "lucide-react";

interface BaseQuestionProps {
  onAnswer: (correct: boolean) => void;
}

interface MultipleChoiceProps extends BaseQuestionProps {
  question: string;
  options: string[];
  correctIndex: number;
}

export function MultipleChoice({ question, options, correctIndex, onAnswer }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    setTimeout(() => onAnswer(index === correctIndex), 1500);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-center">{question}</h2>
      <div className="grid gap-3">
        {options.map((option, i) => (
          <Button
            key={i}
            variant="outline"
            className={cn(
              "h-auto py-4 px-6 text-left justify-start",
              selected === i && answered && i === correctIndex && "border-green-500 bg-green-500/10",
              selected === i && answered && i !== correctIndex && "border-red-500 bg-red-500/10",
              answered && i === correctIndex && "border-green-500"
            )}
            onClick={() => handleSelect(i)}
            disabled={answered}
          >
            <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 text-sm font-medium">
              {String.fromCharCode(65 + i)}
            </span>
            {option}
            {answered && i === correctIndex && <Check className="ml-auto w-5 h-5 text-green-500" />}
            {answered && selected === i && i !== correctIndex && <X className="ml-auto w-5 h-5 text-red-500" />}
          </Button>
        ))}
      </div>
    </div>
  );
}

interface TrueFalseProps extends BaseQuestionProps {
  statement: string;
  isTrue: boolean;
}

export function TrueFalse({ statement, isTrue, onAnswer }: TrueFalseProps) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (value: boolean) => {
    if (answered) return;
    setSelected(value);
    setAnswered(true);
    setTimeout(() => onAnswer(value === isTrue), 1500);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-center">{statement}</h2>
      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          size="lg"
          className={cn(
            "flex-1 max-w-[150px] py-6",
            selected === true && answered && isTrue && "border-green-500 bg-green-500/10",
            selected === true && answered && !isTrue && "border-red-500 bg-red-500/10",
            answered && isTrue && "border-green-500"
          )}
          onClick={() => handleSelect(true)}
          disabled={answered}
        >
          <Check className="w-5 h-5 mr-2" />
          True
        </Button>
        <Button
          variant="outline"
          size="lg"
          className={cn(
            "flex-1 max-w-[150px] py-6",
            selected === false && answered && !isTrue && "border-green-500 bg-green-500/10",
            selected === false && answered && isTrue && "border-red-500 bg-red-500/10",
            answered && !isTrue && "border-green-500"
          )}
          onClick={() => handleSelect(false)}
          disabled={answered}
        >
          <X className="w-5 h-5 mr-2" />
          False
        </Button>
      </div>
    </div>
  );
}

interface FillBlankProps extends BaseQuestionProps {
  sentence: string;
  answer: string;
}

export function FillBlank({ sentence, answer, onAnswer }: FillBlankProps) {
  const [input, setInput] = useState("");
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (answered || !input.trim()) return;
    const correct = input.toLowerCase().trim() === answer.toLowerCase();
    setIsCorrect(correct);
    setAnswered(true);
    setTimeout(() => onAnswer(correct), 1500);
  };

  const parts = sentence.split('___');

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-center">Fill in the blank</h2>
      <p className="text-lg text-center">
        {parts[0]}
        <span className={cn(
          "inline-block min-w-[100px] border-b-2 mx-2 px-2",
          answered && (isCorrect ? "border-green-500 text-green-500" : "border-red-500 text-red-500")
        )}>
          {answered ? (isCorrect ? input : answer) : input || '___'}
        </span>
        {parts[1]}
      </p>
      <div className="flex gap-2 max-w-md mx-auto">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer"
          disabled={answered}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <Button onClick={handleSubmit} disabled={answered || !input.trim()}>
          Check
        </Button>
      </div>
      {answered && !isCorrect && (
        <p className="text-center text-sm text-muted-foreground">
          Correct answer: <span className="text-green-500 font-medium">{answer}</span>
        </p>
      )}
    </div>
  );
}

interface SwipeCardProps extends BaseQuestionProps {
  scenario: string;
  isBullish: boolean;
}

export function SwipeCard({ scenario, isBullish, onAnswer }: SwipeCardProps) {
  const [swiped, setSwiped] = useState<'left' | 'right' | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (answered) return;
    setSwiped(direction);
    setAnswered(true);
    const userSaidBullish = direction === 'right';
    setTimeout(() => onAnswer(userSaidBullish === isBullish), 1500);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-center">Bullish or Bearish?</h2>
      <Card className={cn(
        "p-6 text-center transition-all",
        swiped === 'right' && "border-green-500 bg-green-500/10",
        swiped === 'left' && "border-red-500 bg-red-500/10"
      )}>
        <p className="text-lg">{scenario}</p>
      </Card>
      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 max-w-[150px] py-6 text-red-500 hover:bg-red-500/10"
          onClick={() => handleSwipe('left')}
          disabled={answered}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Bearish
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1 max-w-[150px] py-6 text-green-500 hover:bg-green-500/10"
          onClick={() => handleSwipe('right')}
          disabled={answered}
        >
          Bullish
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
      {answered && (
        <p className="text-center text-sm">
          {(swiped === 'right') === isBullish ? (
            <span className="text-green-500">Correct!</span>
          ) : (
            <span className="text-red-500">
              Wrong! This scenario is {isBullish ? 'bullish' : 'bearish'}.
            </span>
          )}
        </p>
      )}
    </div>
  );
}
