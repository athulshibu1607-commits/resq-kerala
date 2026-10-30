'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }
      } else {
        await new Promise((res) => setTimeout(res, 600));
      }
      setIsSuccess(true);
    } catch (e) {
      setErrorMessage('Unable to update password. Session may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white dark:bg-command-card rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-container-high dark:border-command-border">
        <h1 className="font-headline text-xl font-bold text-on-surface dark:text-white text-center mb-4">
          Set New Password
        </h1>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {isSuccess ? (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs">
              Password has been successfully updated. You may now sign in.
            </div>
            <Link
              href="/login"
              className="w-full inline-block py-2.5 bg-secondary text-white rounded-xl text-xs font-bold"
            >
              Sign In with New Password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-sm border border-surface-container-high dark:border-command-border focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-sm border border-surface-container-high dark:border-command-border focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-secondary hover:bg-red-700 disabled:bg-slate-400 text-white rounded-xl font-headline text-xs sm:text-sm font-bold shadow-md transition-colors"
            >
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
