'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          // Never reveal if an email exists
        }
      } else {
        await new Promise((res) => setTimeout(res, 600));
      }
      setIsSubmitted(true);
    } catch (e) {
      setErrorMessage('Unable to process password reset request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white dark:bg-command-card rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-container-high dark:border-command-border">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container/10 flex items-center justify-center text-secondary mx-auto mb-3">
            <span className="material-symbols-outlined text-[28px]">lock_reset</span>
          </div>
          <h1 className="font-headline text-xl font-bold text-on-surface dark:text-white">
            Reset Your Password
          </h1>
          <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-1">
            പാസ്‌വേഡ് പുനഃസ്ഥാപിക്കുക · Enter your registered email to receive recovery instructions.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {isSubmitted ? (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs">
              If an account exists for <strong>{email}</strong>, a password reset link has been dispatched to your inbox.
            </div>
            <Link
              href="/login"
              className="w-full inline-block py-2.5 bg-primary-container text-white rounded-xl text-xs font-bold"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
                Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-sm border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-secondary hover:bg-red-700 disabled:bg-slate-400 text-white rounded-xl font-headline text-xs sm:text-sm font-bold shadow-md transition-colors"
            >
              {isLoading ? 'Sending Link...' : 'Send Recovery Link'}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-on-surface-variant dark:text-command-subtle hover:underline">
                Remember your password? Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
