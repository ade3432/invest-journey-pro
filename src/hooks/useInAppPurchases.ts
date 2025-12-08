import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// RevenueCat offering identifier - configure in RevenueCat dashboard
export const PREMIUM_OFFERING_ID = 'default';
export const PREMIUM_PACKAGE_ID = 'premium';

interface PurchaseState {
  isPremium: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
}

export const useInAppPurchases = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<PurchaseState>({
    isPremium: false,
    isLoading: true,
    isPurchasing: false,
  });

  // Check premium status from database
  const checkPremiumStatus = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, isPremium: false, isLoading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Check is_premium field (will be in the data once types refresh)
      const isPremium = (data as any)?.is_premium || false;

      setState(prev => ({
        ...prev,
        isPremium,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error checking premium status:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    checkPremiumStatus();
  }, [checkPremiumStatus]);

  // Initialize In-App Purchases (only on native platforms)
  const initializePurchases = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('In-App Purchases only available on native platforms');
      return null;
    }

    try {
      const purchasesModule = await import('capacitor-purchases');
      return purchasesModule.CapacitorPurchases;
    } catch (error) {
      console.error('Failed to initialize purchases:', error);
      return null;
    }
  }, []);

  // Update premium status in database
  const updatePremiumStatus = useCallback(async (isPremium: boolean) => {
    if (!user) return;

    try {
      // Use raw update since types may not have is_premium yet
      const { error } = await supabase
        .from('user_progress')
        .update({ is_premium: isPremium } as any)
        .eq('user_id', user.id);

      if (error) throw error;

      setState(prev => ({ ...prev, isPremium }));
    } catch (error) {
      console.error('Error updating premium status:', error);
      throw error;
    }
  }, [user]);

  // Purchase premium
  const purchasePremium = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to purchase premium.',
        variant: 'destructive',
      });
      return false;
    }

    setState(prev => ({ ...prev, isPurchasing: true }));

    try {
      if (!Capacitor.isNativePlatform()) {
        toast({
          title: 'Native only',
          description: 'In-App Purchases are only available in the iOS/Android app.',
          variant: 'destructive',
        });
        setState(prev => ({ ...prev, isPurchasing: false }));
        return false;
      }

      const Purchases = await initializePurchases();
      if (!Purchases) {
        throw new Error('Purchases not available');
      }

      // Get offerings from RevenueCat
      const { offerings } = await Purchases.getOfferings();

      if (!offerings.current?.availablePackages?.length) {
        throw new Error('No products available');
      }

      // Find the premium package
      const premiumPackage = offerings.current.availablePackages.find(
        pkg => pkg.identifier === PREMIUM_PACKAGE_ID || pkg.identifier === '$rc_lifetime'
      ) || offerings.current.availablePackages[0];

      if (!premiumPackage) {
        throw new Error('Premium package not found');
      }

      // Make purchase
      const { purchaserInfo } = await Purchases.purchasePackage({
        identifier: premiumPackage.identifier,
        offeringIdentifier: offerings.current.identifier,
      });

      // Check if purchase was successful
      if (purchaserInfo?.entitlements?.active?.['premium']) {
        await updatePremiumStatus(true);

        toast({
          title: 'Welcome to Premium! 🎉',
          description: 'You now have access to all features.',
        });

        setState(prev => ({ ...prev, isPurchasing: false }));
        return true;
      }
    } catch (error: any) {
      console.error('Purchase error:', error);

      // Handle user cancellation gracefully
      if (error.code === 1 || error.message?.includes('cancelled') || error.message?.includes('canceled')) {
        toast({
          title: 'Purchase cancelled',
          description: 'You can try again anytime.',
        });
      } else {
        toast({
          title: 'Purchase failed',
          description: error.message || 'Please try again later.',
          variant: 'destructive',
        });
      }
    }

    setState(prev => ({ ...prev, isPurchasing: false }));
    return false;
  }, [user, toast, initializePurchases, updatePremiumStatus]);

  // Restore purchases
  const restorePurchases = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to restore purchases.',
        variant: 'destructive',
      });
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      if (!Capacitor.isNativePlatform()) {
        toast({
          title: 'Native only',
          description: 'Restore is only available in the iOS/Android app.',
          variant: 'destructive',
        });
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      const Purchases = await initializePurchases();
      if (!Purchases) {
        throw new Error('Purchases not available');
      }

      const { purchaserInfo } = await Purchases.restoreTransactions();

      // Check if premium entitlement exists
      const hasPremium = purchaserInfo?.entitlements?.active?.['premium'] !== undefined;

      if (hasPremium) {
        await updatePremiumStatus(true);

        toast({
          title: 'Purchases restored! 🎉',
          description: 'Your premium access has been restored.',
        });

        setState(prev => ({ ...prev, isLoading: false }));
        return true;
      } else {
        toast({
          title: 'No purchases found',
          description: 'No previous purchases were found to restore.',
        });
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      toast({
        title: 'Restore failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    }

    setState(prev => ({ ...prev, isLoading: false }));
    return false;
  }, [user, toast, initializePurchases, updatePremiumStatus]);

  return {
    isPremium: state.isPremium,
    isLoading: state.isLoading,
    isPurchasing: state.isPurchasing,
    purchasePremium,
    restorePurchases,
    checkPremiumStatus,
  };
};
