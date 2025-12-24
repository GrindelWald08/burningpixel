import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_SESSION_KEY = 'admin_authenticated';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    const sessionData = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (sessionData) {
      const { timestamp } = JSON.parse(sessionData);
      if (Date.now() - timestamp < SESSION_DURATION) {
        setIsAuthenticated(true);
      } else {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
      }
    }
    setIsLoading(false);
  };

  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-admin-password', {
        body: { password },
      });

      if (error) {
        return { success: false, error: 'Failed to verify password' };
      }

      if (data.success) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ timestamp: Date.now() }));
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: data.error || 'Incorrect password' };
    } catch (err) {
      return { success: false, error: 'Connection error' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isLoading, login, logout };
};