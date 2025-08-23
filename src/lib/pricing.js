// Paddle Price IDs - Update these with your actual price IDs from Paddle dashboard

export const PRICING_PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: null, // No checkout needed for free plan
    features: [
      "30 minutes of transcription",
      "Basic accuracy",
      "Standard processing speed",
      "Export to TXT"
    ]
  },
  
  PRO: {
    name: "Lite",
    price: 19,
    priceId: 'pri_01k399jhfp27dnef4eah1z28y2', // TODO: Replace with your actual Pro plan price ID from Paddle dashboard
    features: [
      "10 hours of transcription/month",
      "High accuracy (95%+)",
      "Priority processing",
      "Export to TXT, DOCX, PDF",
      "Speaker identification",
      "Timestamps"
    ]
  },
  
  BUSINESS: {
    name: "Business",
    price: 49,
    priceId: null, // TODO: Replace with your actual Business plan price ID from Paddle dashboard
    features: [
      "50 hours of transcription/month",
      "Highest accuracy (98%+)",
      "Fastest processing",
      "All export formats",
      "Advanced speaker identification",
      "Custom vocabulary",
      "API access",
      "Priority support"
    ]
  }
};

// One-time purchase options (if you want to offer pay-per-use)
export const ONE_TIME_PURCHASES = {
  SMALL_PACK: {
    name: "Small Pack",
    price: 9.99,
    priceId: "pri_small_pack_id", // Replace with actual price ID
    description: "5 hours of transcription",
    hours: 5
  },
  
  LARGE_PACK: {
    name: "Large Pack", 
    price: 29.99,
    priceId: "pri_large_pack_id", // Replace with actual price ID
    description: "20 hours of transcription",
    hours: 20
  }
};

// Helper function to get plan by key
export function getPlan(planKey) {
  return PRICING_PLANS[planKey.toUpperCase()];
}

// Helper function to get all subscription plans
export function getSubscriptionPlans() {
  return Object.values(PRICING_PLANS).filter(plan => plan.priceId !== null);
}