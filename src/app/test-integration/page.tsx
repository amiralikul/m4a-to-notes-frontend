'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaddleCheckout } from '@/components/paddle-checkout';
import { PRICING_PLANS } from '@/lib/pricing';

export default function TestIntegrationPage() {
  const { user, isLoaded } = useUser();
  const [entitlements, setEntitlements] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEntitlements = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/me/entitlements', {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      setEntitlements(data.entitlements);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch entitlements:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchEntitlements();
    }
  }, [isLoaded, user, fetchEntitlements]);

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'business': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trialing': return 'bg-yellow-100 text-yellow-800';
      case 'past_due': return 'bg-orange-100 text-orange-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to test the integration</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Paddle + Clerk Integration Test</h1>
        <p className="text-gray-600 mt-2">Test the complete billing and entitlements flow</p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>👤 User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><strong>Clerk User ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{user.id}</code></div>
          <div><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</div>
          <div><strong>Full Name:</strong> {user.fullName || 'Not set'}</div>
        </CardContent>
      </Card>

      {/* Entitlements Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>🎯 Current Entitlements</CardTitle>
            <CardDescription>Real-time entitlements from KV storage</CardDescription>
          </div>
          <Button onClick={fetchEntitlements} disabled={loading} size="sm">
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-600 bg-red-50 p-4 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          ) : entitlements ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Badge className={getPlanColor(entitlements.plan)}>
                  Plan: {entitlements.plan.toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(entitlements.status)}>
                  Status: {entitlements.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600">
                <div><strong>Provider:</strong> {entitlements.provider}</div>
                <div><strong>Last Updated:</strong> {new Date(entitlements.updatedAt).toLocaleString()}</div>
                {entitlements.meta?.subscriptionId && (
                  <div><strong>Subscription ID:</strong> <code>{entitlements.meta.subscriptionId}</code></div>
                )}
                {entitlements.meta?.periodEnd && (
                  <div><strong>Period End:</strong> {new Date(entitlements.meta.periodEnd).toLocaleString()}</div>
                )}
              </div>
            </div>
          ) : (
            <div>Loading entitlements...</div>
          )}
        </CardContent>
      </Card>

      {/* Test Checkout */}
      <Card>
        <CardHeader>
          <CardTitle>🛒 Test Paddle Checkout</CardTitle>
          <CardDescription>Test the complete purchase flow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Test Card Details</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Card:</strong> 4242 4242 4242 4242</div>
              <div><strong>Expiry:</strong> Any future date</div>
              <div><strong>CVC:</strong> 100</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Pro Plan</h4>
              <div className="text-2xl font-bold text-blue-600 mb-2">${PRICING_PLANS.PRO.price}/mo</div>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                {PRICING_PLANS.PRO.features.slice(0, 3).map((feature, i) => (
                  <li key={i}>• {feature}</li>
                ))}
              </ul>
              <PaddleCheckout
                priceId={PRICING_PLANS.PRO.priceId}
                className="w-full"
              >
                Test Purchase Pro Plan
              </PaddleCheckout>
            </div>

            {PRICING_PLANS.BUSINESS.priceId && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Business Plan</h4>
                <div className="text-2xl font-bold text-purple-600 mb-2">${PRICING_PLANS.BUSINESS.price}/mo</div>
                <ul className="text-sm text-gray-600 mb-4 space-y-1">
                  {PRICING_PLANS.BUSINESS.features.slice(0, 3).map((feature, i) => (
                    <li key={i}>• {feature}</li>
                  ))}
                </ul>
                <PaddleCheckout
                  priceId={PRICING_PLANS.BUSINESS.priceId}
                  className="w-full"
                >
                  Test Purchase Business Plan
                </PaddleCheckout>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integration Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>✅ Integration Checklist</CardTitle>
          <CardDescription>Verify each part of the integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></span>
              <span>User authenticated with Clerk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full flex-shrink-0 ${entitlements ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              <span>Entitlements loaded from Worker</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full flex-shrink-0 ${PRICING_PLANS.PRO.priceId && PRICING_PLANS.PRO.priceId.startsWith('pri_') ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>Paddle price IDs configured</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0"></span>
              <span>Ready for checkout testing</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <ol className="list-decimal list-inside space-y-1">
            <li>Verify your entitlements show &quot;free&quot; plan initially</li>
            <li>Click &quot;Test Purchase Pro Plan&quot; to open Paddle checkout</li>
            <li>Complete purchase with test card details above</li>
            <li>Return to this page and click &quot;Refresh&quot; to see updated entitlements</li>
            <li>Check browser DevTools console for detailed logs</li>
            <li>Verify entitlements now show &quot;pro&quot; plan with &quot;active&quot; status</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}