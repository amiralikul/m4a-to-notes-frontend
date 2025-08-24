import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get internal API secret
    const internalSecret = process.env.INTERNAL_API_SECRET;

    if (!internalSecret) {
      console.error('Missing INTERNAL_API_SECRET environment variable');
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      );
    }

    console.log('Fetching entitlements for user:', userId);

    // Fetch entitlements directly from Worker via Next.js proxy
    const response = await fetch(`http://localhost:3000/api/entitlements/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': internalSecret
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch entitlements from worker:', {
        status: response.status,
        error: errorText,
        userId
      });
      
      // Return default entitlements on error
      return NextResponse.json({
        entitlements: {
          userId,
          plan: 'free',
          status: 'none',
          provider: 'paddle',
          meta: {},
          updatedAt: new Date().toISOString()
        }
      });
    }

    const result = await response.json();
    
    console.log('Entitlements fetched successfully:', {
      userId,
      plan: result.entitlements?.plan,
      status: result.entitlements?.status
    });

    return NextResponse.json({
      entitlements: result.entitlements
    });

  } catch (error) {
    console.error('Error fetching user entitlements:', {
      error: error.message,
      stack: error.stack
    });
    
    // Return default entitlements on error
    return NextResponse.json({
      entitlements: {
        userId: null,
        plan: 'free',
        status: 'none',
        provider: 'paddle',
        meta: {},
        updatedAt: new Date().toISOString()
      }
    }, { status: 500 });
  }
}