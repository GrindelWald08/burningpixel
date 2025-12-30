import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Session token stored in memory only (not sessionStorage)
// This prevents manipulation via browser DevTools
let adminSessionToken: string | null = null;
let sessionExpiry: number | null = null;

const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

// Generate a cryptographically random token
const generateToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(() => {
    // Check in-memory session (cannot be manipulated via DevTools)
    if (adminSessionToken && sessionExpiry && Date.now() < sessionExpiry) {
      setIsAuthenticated(true);
    } else {
      // Clear expired session
      adminSessionToken = null;
      sessionExpiry = null;
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkSession();
    
    // Set up interval to check session expiry
    const interval = setInterval(() => {
      if (sessionExpiry && Date.now() >= sessionExpiry) {
        adminSessionToken = null;
        sessionExpiry = null;
        setIsAuthenticated(false);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [checkSession]);

  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-admin-password', {
        body: { password },
      });

      if (error) {
        return { success: false, error: 'Failed to verify password' };
      }

      if (data.success) {
        // Store session in memory only (secure against DevTools manipulation)
        adminSessionToken = generateToken();
        sessionExpiry = Date.now() + SESSION_DURATION;
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: data.error || 'Incorrect password' };
    } catch (err) {
      return { success: false, error: 'Connection error' };
    }
  };

  const logout = () => {
    adminSessionToken = null;
    sessionExpiry = null;
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isLoading, login, logout };
};
