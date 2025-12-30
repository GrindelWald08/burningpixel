import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// In-memory rate limiting store (per function instance)
// For production, consider using a database table or Redis
const attemptTracker = new Map<string, { count: number; firstAttempt: number; lockedUntil?: number }>();

function getClientIP(req: Request): string {
  // Try to get real IP from headers (set by proxy/load balancer)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

function isRateLimited(ip: string): { limited: boolean; retryAfter?: number } {
  const now = Date.now();
  const tracker = attemptTracker.get(ip);
  
  if (!tracker) {
    return { limited: false };
  }
  
  // Check if locked out
  if (tracker.lockedUntil && now < tracker.lockedUntil) {
    return { 
      limited: true, 
      retryAfter: Math.ceil((tracker.lockedUntil - now) / 1000) 
    };
  }
  
  // Reset if lockout expired
  if (tracker.lockedUntil && now >= tracker.lockedUntil) {
    attemptTracker.delete(ip);
    return { limited: false };
  }
  
  return { limited: false };
}

function recordFailedAttempt(ip: string): { locked: boolean; attemptsRemaining: number } {
  const now = Date.now();
  const tracker = attemptTracker.get(ip);
  
  if (!tracker) {
    attemptTracker.set(ip, { count: 1, firstAttempt: now });
    return { locked: false, attemptsRemaining: MAX_ATTEMPTS - 1 };
  }
  
  // Reset count if first attempt was more than lockout duration ago
  if (now - tracker.firstAttempt > LOCKOUT_DURATION_MS) {
    attemptTracker.set(ip, { count: 1, firstAttempt: now });
    return { locked: false, attemptsRemaining: MAX_ATTEMPTS - 1 };
  }
  
  tracker.count++;
  
  if (tracker.count >= MAX_ATTEMPTS) {
    tracker.lockedUntil = now + LOCKOUT_DURATION_MS;
    console.log(`IP ${ip} locked out for ${LOCKOUT_DURATION_MS / 1000} seconds after ${tracker.count} failed attempts`);
    return { locked: true, attemptsRemaining: 0 };
  }
  
  return { locked: false, attemptsRemaining: MAX_ATTEMPTS - tracker.count };
}

function clearAttempts(ip: string): void {
  attemptTracker.delete(ip);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  
  // Check rate limiting before processing
  const rateLimitCheck = isRateLimited(clientIP);
  if (rateLimitCheck.limited) {
    console.log(`Rate limited request from IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Too many failed attempts. Please try again in ${rateLimitCheck.retryAfter} seconds.` 
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimitCheck.retryAfter)
        } 
      }
    );
  }

  try {
    const { password } = await req.json();
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');

    console.log(`Admin password verification attempt from IP: ${clientIP}`);

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable not set');
      return new Response(
        JSON.stringify({ success: false, error: 'Admin password not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (password === adminPassword) {
      // Clear failed attempts on successful login
      clearAttempts(clientIP);
      console.log(`Admin password verified successfully from IP: ${clientIP}`);
      
      // Log successful admin login
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase.from('activity_logs').insert({
          action: 'admin_login',
          description: 'Admin password authentication successful',
          ip_address: clientIP,
          metadata: { auth_method: 'password' }
        });
      } catch (logError) {
        console.error('Failed to log admin login:', logError);
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Record failed attempt
      const attemptResult = recordFailedAttempt(clientIP);
      console.log(`Admin password verification failed from IP: ${clientIP}. Attempts remaining: ${attemptResult.attemptsRemaining}`);
      
      // Log failed attempt
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase.from('activity_logs').insert({
          action: 'admin_login_failed',
          description: attemptResult.locked 
            ? 'Admin login failed - account locked due to too many attempts' 
            : 'Admin password authentication failed',
          ip_address: clientIP,
          metadata: { 
            auth_method: 'password',
            attempts_remaining: attemptResult.attemptsRemaining,
            locked: attemptResult.locked
          }
        });
      } catch (logError) {
        console.error('Failed to log failed admin login:', logError);
      }
      
      if (attemptResult.locked) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Too many failed attempts. Please try again later.' 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Incorrect password. ${attemptResult.attemptsRemaining} attempts remaining.` 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error verifying admin password:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
