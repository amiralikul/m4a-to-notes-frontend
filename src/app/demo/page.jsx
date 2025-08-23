'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExampleCheckout } from "@/components/paddle-checkout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Paddle Checkout Demo</h1>
          <p className="text-muted-foreground">
            Test the Paddle integration in sandbox mode
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Paddle Integration Status</CardTitle>
            <CardDescription>
              Current environment and configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Environment:</strong> {process.env.NEXT_PUBLIC_PADDLE_ENV || 'Not set'}
              </div>
              <div>
                <strong>Client Token:</strong> {process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ? 'Configured' : 'Not set'}
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-2">To test checkout:</p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>Make sure you have valid Paddle sandbox credentials in your .env</li>
                <li>Create a product and price in your Paddle sandbox dashboard</li>
                <li>Update the priceId in the ExampleCheckout component below</li>
                <li>Use test card: 4242 4242 4242 4242, any future date, CVC: 100</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <ExampleCheckout />

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <h4 className="font-medium">1. Update Price IDs</h4>
              <p className="text-muted-foreground">
                Go to <code>/src/lib/pricing.js</code> and update the price IDs with your actual Paddle price IDs.
              </p>
            </div>
            
            <div className="space-y-2 text-sm">
              <h4 className="font-medium">2. Set Up Webhooks</h4>
              <p className="text-muted-foreground">
                Configure webhook endpoint in Paddle dashboard: <code>https://yourdomain.com/api/webhook</code>
              </p>
            </div>
            
            <div className="space-y-2 text-sm">
              <h4 className="font-medium">3. Test Complete Flow</h4>
              <p className="text-muted-foreground">
                Test the full checkout process and verify webhook events are received.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}