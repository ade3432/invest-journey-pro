import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface PricingPlan {
  id: string;
  productId: string;
  name: string;
  price: number;
  period: string;
  periodMonths: number;
  savings?: number;
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    productId: 'premium_monthly',
    name: 'Monthly',
    price: 4.99,
    period: 'month',
    periodMonths: 1,
  },
  {
    id: 'quarterly',
    productId: 'premium_quarterly',
    name: '3 Months',
    price: 12.99,
    period: '3 months',
    periodMonths: 3,
    savings: 13,
    popular: true,
  },
  {
    id: 'yearly',
    productId: 'premium_yearly',
    name: 'Yearly',
    price: 39.99,
    period: 'year',
    periodMonths: 12,
    savings: 33,
  },
];

const PREMIUM_FEATURES = [
  'Unlimited lessons & modules',
  'Advanced chart pattern recognition',
  'AI-powered trading tutor',
  'Real-time market analysis',
  'Exclusive trading strategies',
  'Priority customer support',
  'No ads, ever',
];

interface PricingPlansProps {
  onSelectPlan: (plan: PricingPlan) => void;
  isPurchasing?: boolean;
  selectedPlanId?: string;
}

export function PricingPlans({ onSelectPlan, isPurchasing, selectedPlanId }: PricingPlansProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Crown className="h-6 w-6 text-amber-500" />
          <h2 className="text-2xl font-bold">Go Premium</h2>
        </div>
        <p className="text-muted-foreground">
          Unlock your full trading potential
        </p>
        <div className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          3-day free trial on all plans
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-4">
        {PRICING_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              'relative p-4 cursor-pointer transition-all duration-200',
              plan.popular
                ? 'border-2 border-primary bg-primary/5 shadow-lg'
                : 'border border-border hover:border-primary/50',
              selectedPlanId === plan.id && 'ring-2 ring-primary'
            )}
            onClick={() => !isPurchasing && onSelectPlan(plan)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  {plan.savings && (
                    <span className="bg-green-500/10 text-green-600 text-xs font-bold px-2 py-0.5 rounded">
                      SAVE {plan.savings}%
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  Billed every {plan.period}
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground text-sm">/{plan.period}</span>
                </div>
                {plan.periodMonths > 1 && (
                  <p className="text-xs text-muted-foreground">
                    ${(plan.price / plan.periodMonths).toFixed(2)}/month
                  </p>
                )}
              </div>
            </div>

            {plan.popular && (
              <div className="mt-3 flex items-center gap-1.5 text-primary text-sm">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Best value for serious traders</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Features List */}
      <div className="space-y-3">
        <h4 className="font-semibold text-center">What's included:</h4>
        <div className="grid gap-2">
          {PREMIUM_FEATURES.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subscribe Button */}
      <Button
        className="w-full h-12 text-base font-semibold"
        disabled={isPurchasing || !selectedPlanId}
        onClick={() => {
          const plan = PRICING_PLANS.find(p => p.id === selectedPlanId);
          if (plan) onSelectPlan(plan);
        }}
      >
        {isPurchasing ? (
          'Processing...'
        ) : selectedPlanId ? (
          'Start Free Trial'
        ) : (
          'Select a plan'
        )}
      </Button>

      {/* Terms */}
      <p className="text-xs text-center text-muted-foreground">
        Cancel anytime. After the 3-day trial, you'll be charged for the selected plan.
        Subscriptions auto-renew unless cancelled.
      </p>
    </div>
  );
}
