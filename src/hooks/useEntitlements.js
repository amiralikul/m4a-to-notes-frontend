'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

/**
 * Custom hook to fetch and manage user entitlements
 * @returns {Object} { entitlements, loading, error, refetch, hasAccess }
 */
export function useEntitlements() {
  const { user, isLoaded } = useUser();
  const [entitlements, setEntitlements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEntitlements = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
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
    if (isLoaded) {
      fetchEntitlements();
    }
  }, [isLoaded, fetchEntitlements]);

  /**
   * Check if user has access to a specific feature
   * @param {string} feature - 'basic', 'pro', or 'business'
   * @returns {boolean}
   */
  const hasAccess = (feature = 'basic') => {
    if (!entitlements) return false;
    
    const hasActiveSubscription = ['trialing', 'active'].includes(entitlements.status);
    
    switch (feature) {
      case 'basic':
        return true; // Everyone has basic access
      case 'pro':
        return entitlements.plan === 'pro' && hasActiveSubscription ||
               entitlements.plan === 'business' && hasActiveSubscription;
      case 'business':
        return entitlements.plan === 'business' && hasActiveSubscription;
      default:
        return false;
    }
  };

  /**
   * Check if user is on a specific plan
   * @param {string} plan - 'free', 'pro', or 'business'
   * @returns {boolean}
   */
  const isPlan = (plan) => {
    return entitlements?.plan === plan;
  };

  /**
   * Check if subscription is currently active
   * @returns {boolean}
   */
  const isActive = () => {
    return ['active', 'trialing'].includes(entitlements?.status);
  };

  return {
    entitlements,
    loading,
    error,
    refetch: fetchEntitlements,
    hasAccess,
    isPlan,
    isActive
  };
}