import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('paddle-signature');
    // const webhookSecret = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET;

    // if (!webhookSecret) {
    //   console.error('Webhook secret not configured');
    //   return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    // }

    // Verify webhook signature
    // if (!verifyWebhookSignature(body, signature, webhookSecret)) {
    //   console.error('Invalid webhook signature');
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const event = JSON.parse(body);
    
    console.log('Received Paddle webhook:', {
      eventType: event.event_type,
      eventId: event.event_id,
      timestamp: event.occurred_at
    });

    // Handle different event types
    switch (event.event_type) {
      case 'transaction.completed':
        await handleTransactionCompleted(event.data);
        break;
      
      case 'subscription.created':
        await handleSubscriptionCreated(event.data);
        break;
      
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data);
        break;
      
      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data);
        break;
      
      case 'customer.created':
        await handleCustomerCreated(event.data);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.event_type}`);
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

function verifyWebhookSignature(body, signature, secret) {
  if (!signature) return false;
  
  try {
    // Extract timestamp and signature from header
    const parts = signature.split(';');
    let ts, h1;
    
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 'ts') ts = value;
      if (key === 'h1') h1 = value;
    }
    
    if (!ts || !h1) return false;
    
    // Create expected signature
    const payload = `${ts}:${body}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(h1, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

async function handleTransactionCompleted(transaction) {
  console.log('Transaction completed:', transaction.id);
  
  // TODO: Update your database with transaction details
  // Example: Save transaction to database, send confirmation email, etc.
  
  // You might want to:
  // - Save the transaction to your database
  // - Send a confirmation email to the customer
  // - Trigger any post-purchase workflows
  // - Update user access/permissions
}

async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);
  
  // TODO: Handle new subscription
  // Example: Grant access to premium features, send welcome email
  
  // You might want to:
  // - Save subscription details to your database
  // - Grant user access to premium features
  // - Send welcome email
  // - Set up recurring processes
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  
  // TODO: Handle subscription changes
  // Example: Update user access based on new plan
}

async function handleSubscriptionCanceled(subscription) {
  console.log('Subscription canceled:', subscription.id);
  
  // TODO: Handle subscription cancellation
  // Example: Revoke access at period end, send cancellation email
}

async function handleCustomerCreated(customer) {
  console.log('Customer created:', customer.id);
  
  // TODO: Handle new customer
  // Example: Save customer details, sync with your user system
}