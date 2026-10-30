'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser, switchRole } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();

      if (supabase) {
        // Authenticate against real Supabase Backend
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Generic authentication error: Never reveal whether an email exists
          setErrorMessage('Invalid credentials. Please verify your email and password.');
          setIsLoading(false);
          return;
        }

        if (data.user) {
          // Fetch verified server-side role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .single();

          const role = roleData?.role || 'citizen';
          switchRole(role);

          // Redirect to authorized destination based on server role
          if (role === 'admin') router.push('/admin');
          else if (role === 'volunteer') router.push('/volunteer');
          else router.push('/citizen');
          return;
        }
      } else {
        // Safe development simulation when Supabase keys are not configured in .env.local
        // SECURITY: Never grant admin or volunteer roles based on client input or email string.
        // All accounts default strictly to 'citizen'. Privileged roles can only be granted server-side.
        const defaultRole: 'citizen' = 'citizen';

        // Simulate network latency
        await new Promise((res) => setTimeout(res, 500));

        setUser({
          ...user,
          email,
          name: email.split('@')[0],
          role: defaultRole,
          isVerified: true,
          activeBadge: 'Verified Citizen (Local Session)',
        });
        switchRole(defaultRole);
        router.push('/citizen');
      }
    } catch (err: any) {
      setErrorMessage('A network error occurred while contacting authentication servers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20">
      {/* Emergency Skip-Login Banner */}
      <div className="w-full bg-secondary text-white rounded-2xl p-4 sm:p-5 mb-8 shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              അടിയന്തിര ഘട്ടം · Urgent Crisis
            </span>
          </div>
          <h2 className="font-headline text-lg sm:text-xl font-bold mt-1">
            In immediate danger from floodwaters or landslides?
          </h2>
          <p className="text-xs sm:text-sm text-white/90">
            Skip standard sign-in and trigger instant satellite GPS dispatch right now.
          </p>
        </div>

        <Link
          href="/citizen/sos"
          className="relative z-10 shrink-0 px-5 py-2.5 bg-white text-secondary hover:bg-surface-container-low rounded-xl font-headline text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">emergency_heat</span>
          <span>1-TAP EMERGENCY SOS</span>
        </Link>
      </div>

      {/* Main Centered Login Card */}
      <div className="max-w-md mx-auto bg-white dark:bg-command-card rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-container-high dark:border-command-border">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container p-1.5 flex items-center justify-center border border-slate-700 shadow-xs">
              <img src="/icons/icon.svg" alt="RESQ KERALA Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-headline text-xl font-black text-on-surface dark:text-white">
              RESQ KERALA
            </span>
          </Link>
          <h1 className="font-headline text-xl font-bold text-on-surface dark:text-white">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-0.5">
            സുരക്ഷിത സൈൻ ഇൻ · Access your citizen requests or responder dashboard
          </p>
        </div>

        {/* Database Connection Status Banner */}
        {!isSupabaseConfigured() ? (
          <div className="mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">info</span>
            <div>
              <span className="font-bold block">Local Simulation Mode</span>
              <span className="text-[11px] leading-tight text-amber-800 dark:text-amber-300 block">
                Supabase database is not configured in <code>.env.local</code>. Authentication is running in browser local storage. No data is stored on a remote server.
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-5 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400 shrink-0">check_circle</span>
            <span className="text-[11px] font-medium">Connected to Supabase PostgreSQL Database</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold flex items-start gap-2 border border-error/20 animate-in fade-in"
          >
            <span className="material-symbols-outlined text-[18px] text-error shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email-input"
              className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5"
            >
              Email Address
            </label>
            <input
              id="email-input"
              type="email"
              required
              autoComplete="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-sm border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password-input"
                className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-secondary dark:text-secondary-fixed hover:underline font-semibold"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-sm border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-2.5 text-on-surface-variant dark:text-command-subtle hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-on-surface-variant dark:text-command-subtle">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-surface-container-high text-secondary focus:ring-secondary"
              />
              <span>Remember session on this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-secondary hover:bg-red-700 disabled:bg-slate-400 text-white rounded-xl font-headline text-sm font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 pt-5 border-t border-surface-container dark:border-command-border text-center space-y-2">
          <p className="text-xs text-on-surface-variant dark:text-command-subtle">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="text-secondary dark:text-secondary-fixed font-bold hover:underline">
              Create an Account
            </Link>
          </p>
          <div>
            <Link
              href="/"
              className="text-[11px] text-on-surface-variant dark:text-command-subtle hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>Back to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
