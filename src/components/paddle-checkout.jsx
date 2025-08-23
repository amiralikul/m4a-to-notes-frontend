'use client';

import { useState } from 'react';
import { usePaddle } from './paddle-provider';
import { Button } from './ui/button';

export function PaddleCheckout({ 
  priceId, 
  quantity = 1, 
  customerEmail,
  className = "",
  children = "Buy Now"
}) {
  const { paddle, isLoading, error } = usePaddle();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const openCheckout = async () => {
    if (!paddle) {
      console.error('Paddle not initialized');
      return;
    }

    if (!priceId) {
      console.error('Price ID is required');
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const checkoutOptions = {
        items: [{ priceId, quantity }],
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          locale: 'en'
        }
      };

      // Add customer email if provided
      if (customerEmail) {
        checkoutOptions.customer = { email: customerEmail };
      }

      // Add return URL for successful checkout
      if (typeof window !== 'undefined') {
        checkoutOptions.settings.successUrl = `${window.location.origin}/checkout/success`;
      }

      await paddle.Checkout.open(checkoutOptions);
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (error) {
    return (
      <Button disabled className={className}>
        Paddle Error
      </Button>
    );
  }

  if (!priceId) {
    return (
      <Button disabled className={className} title="Price ID not configured - see Paddle dashboard setup">
        Setup Required
      </Button>
    );
  }

  return (
    <Button 
      onClick={openCheckout} 
      disabled={isLoading || isCheckoutLoading || !paddle}
      className={className}
    >
      {isLoading || isCheckoutLoading ? 'Loading...' : children}
    </Button>
  );
}

// Example usage component
export function ExampleCheckout() {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Example Paddle Checkout</h2>
      <p className="text-gray-600">
        Replace the priceId with your actual Paddle price ID from your dashboard.
      </p>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-yellow-800 text-sm">
          <strong>⚠️ Setup Required:</strong> This will show a 400 error until you:
        </p>
        <ol className="list-decimal ml-4 space-y-1 text-yellow-700 text-sm mt-2">
          <li>Create a product in your Paddle sandbox dashboard</li>
          <li>Create a price for that product</li>
          <li>Copy the real price ID and update the code below</li>
        </ol>
      </div>

      <PaddleCheckout 
        priceId="pri_example_price_id" 
        quantity={1}
        customerEmail="customer@example.com"
      >
        Purchase Product (Will Error - Demo Only)
      </PaddleCheckout>

      <div className="text-sm text-gray-500 mt-4">
        <p><strong>Steps to fix the 400 error:</strong></p>
        <ol className="list-decimal ml-4 space-y-1">
          <li>Go to your Paddle sandbox dashboard</li>
          <li>Navigate to Catalog → Products</li>
          <li>Create a new product (e.g., "Pro Plan")</li>
          <li>Add a price to the product (e.g., $19/month)</li>
          <li>Copy the price ID (starts with "pri_")</li>
          <li>Update /src/lib/pricing.js with the real price ID</li>
          <li>Test with card: 4242 4242 4242 4242, any future date, CVC: 100</li>
        </ol>
        
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="font-medium">Example valid price ID format:</p>
          <code className="text-green-600">pri_01abc123def456789</code>
        </div>
      </div>
    </div>
  );
}