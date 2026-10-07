// Premium (CulturHist +, Stripe) is switched off for now: the free version is complete.
// Turning this back on restores the subscription check and the upgrade buttons.
export const PREMIUM_ENABLED = false;

// Stripe price IDs for the CulturHist + subscription
export const PREMIUM_PRICES = {
  monthly: 'price_1SGGVyHPnO1VlDbG9d5dPOQc',
  yearly: 'price_1SGGX2HPnO1VlDbG01hfQrdG',
} as const;
