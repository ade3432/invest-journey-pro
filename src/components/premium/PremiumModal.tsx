import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PricingPlans, PricingPlan, PRICING_PLANS } from './PricingPlans';
import { useInAppPurchases } from '@/hooks/useInAppPurchases';

interface PremiumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PremiumModal({ open, onOpenChange }: PremiumModalProps) {
  const { purchasePremium, isPurchasing } = useInAppPurchases();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    PRICING_PLANS.find(p => p.popular)?.id || PRICING_PLANS[0].id
  );

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (selectedPlanId !== plan.id) {
      setSelectedPlanId(plan.id);
      return;
    }

    // Actually purchase if already selected
    const success = await purchasePremium(plan.productId);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Premium Subscription</DialogTitle>
        </DialogHeader>
        <PricingPlans
          onSelectPlan={handleSelectPlan}
          isPurchasing={isPurchasing}
          selectedPlanId={selectedPlanId}
        />
      </DialogContent>
    </Dialog>
  );
}
