'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const { switchRole, setUser } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [district, setDistrict] = useState('Ernakulam');
  const [termsConsent, setTermsConsent] = useState(false);
  const [locationConsent, setLocationConsent] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password entry.');
      return;
    }
    if (!termsConsent) {
      setErrorMessage('You must consent to the Privacy Notice and Terms of Use to create an account.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      if (supabase) {
        // Register with Supabase Auth
        // SECURITY NOTE: The role is ALWAYS enforced as 'citizen' by the database trigger
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone || null,
              preferred_language: preferredLanguage,
              district,
              location_consent: locationConsent,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setErrorMessage(error.message || 'Unable to register account. Please try again.');
          setIsLoading(false);
          return;
        }

        setIsSuccess(true);
      } else {
        // Safe development simulation when Supabase credentials are not yet configured
        await new Promise((res) => setTimeout(res, 800));

        setUser({
          id: `usr-${Date.now()}`,
          name: fullName,
          email,
          phone: phone || '98470 00000',
          role: 'citizen', // Citizen by default
          district,
          isVerified: true,
          activeBadge: 'Verified Resident',
        });
        switchRole('citizen');
        setIsSuccess(true);
      }
    } catch (err: any) {
      setErrorMessage('An unexpected error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white dark:bg-command-card rounded-3xl p-8 shadow-xl border border-surface-container-high dark:border-command-border text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              mark_email_read
            </span>
          </div>

          <h2 className="font-headline text-2xl font-bold text-on-surface dark:text-white">
            Registration Submitted!
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant dark:text-command-subtle mt-2 leading-relaxed">
            We have created your <strong>Citizen</strong> account for <strong>{email}</strong>.
          </p>
          <div className="bg-surface-container-low dark:bg-command-navy p-3.5 rounded-xl border border-surface-container-high dark:border-command-border text-xs text-left my-5 space-y-1">
            <p className="font-bold text-on-surface dark:text-white">Next Steps:</p>
            <p className="text-on-surface-variant dark:text-command-subtle">
              Check your inbox for a verification link to confirm your emergency contact address. You can proceed directly to your Citizen Dashboard.
            </p>
          </div>

          <Link
            href="/citizen"
            className="w-full inline-block py-3 bg-secondary hover:bg-red-700 text-white rounded-xl font-headline text-sm font-bold shadow-md transition-colors"
          >
            Go to Citizen Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24">
      <div className="bg-white dark:bg-command-card rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-container-high dark:border-command-border">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary-container p-1.5 flex items-center justify-center border border-slate-700 shadow-xs">
              <img src="/icons/icon.svg" alt="RESQ KERALA Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-headline text-lg font-black text-on-surface dark:text-white">
              RESQ KERALA
            </span>
          </Link>
          <h1 className="font-headline text-xl sm:text-2xl font-bold text-on-surface dark:text-white">
            Create Your Citizen Account
          </h1>
          <p className="text-xs text-on-surface-variant dark:text-command-subtle mt-0.5">
            റജിസ്ട്രേഷൻ · Access emergency reporting, requests tracking, and shelter telemetry
          </p>
        </div>

        {/* Database Connection Status Banner */}
        {!isSupabaseConfigured() ? (
          <div className="mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">info</span>
            <div>
              <span className="font-bold block">Local Simulation Mode</span>
              <span className="text-[11px] leading-tight text-amber-800 dark:text-amber-300 block">
                Supabase database is not configured in <code>.env.local</code>. Account creation is running locally in browser storage. No data is stored on a remote server.
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-5 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400 shrink-0">check_circle</span>
            <span className="text-[11px] font-medium">Connected to Supabase PostgreSQL Database</span>
          </div>
        )}

        {/* Security Role Disclaimer */}
        <div className="mb-6 p-3 rounded-xl bg-surface-container-low dark:bg-command-navy border border-surface-container-high dark:border-command-border text-[11px] text-on-surface-variant dark:text-command-subtle flex items-start gap-2">
          <span className="material-symbols-outlined text-[16px] text-secondary shrink-0">info</span>
          <div>
            <strong>Notice on Roles:</strong> All new registrations receive the <strong>Citizen</strong> role by default. Volunteer status requires a formal application with skill verification, and Administrator access is strictly controlled by District Disaster Management Authorities.
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold flex items-start gap-2 border border-error/20"
          >
            <span className="material-symbols-outlined text-[18px] text-error shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
              Full Name (പൂർണ്ണ നാമം) <span className="text-secondary">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="E.g., Anjali Menon"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-sm border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
                Email Address <span className="text-secondary">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-sm border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                maxLength={10}
                placeholder="98470 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-sm border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
                Password <span className="text-secondary">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-sm border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-on-surface-variant dark:text-command-subtle"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
                Confirm Password <span className="text-secondary">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-4 py-2.5 rounded-xl text-sm border border-surface-container-high dark:border-command-border focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
                Primary District (ജില്ല)
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-3.5 py-2.5 rounded-xl text-sm border border-surface-container-high dark:border-command-border focus:outline-none"
              >
                {['Ernakulam', 'Wayanad', 'Idukki', 'Alappuzha', 'Pathanamthitta', 'Thrissur', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Kannur', 'Kasaragod', 'Kollam', 'Thiruvananthapuram'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-command-subtle mb-1.5">
                Preferred Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full bg-surface-container-low dark:bg-command-navy text-on-surface dark:text-white px-3.5 py-2.5 rounded-xl text-sm border border-surface-container-high dark:border-command-border focus:outline-none"
              >
                <option value="en">English (Default)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
              </select>
            </div>
          </div>

          {/* Consents */}
          <div className="pt-2 space-y-2.5 border-t border-surface-container dark:border-command-border">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-on-surface-variant dark:text-command-subtle">
              <input
                type="checkbox"
                required
                checked={termsConsent}
                onChange={(e) => setTermsConsent(e.target.checked)}
                className="mt-0.5 rounded border-surface-container-high text-secondary focus:ring-secondary"
              />
              <span>
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="text-secondary dark:text-secondary-fixed underline">
                  Terms of Use
                </Link>{' '}
                and understand how my data is protected under the{' '}
                <Link href="/privacy" target="_blank" className="text-secondary dark:text-secondary-fixed underline">
                  Privacy Notice
                </Link>
                . <span className="text-secondary">*</span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-on-surface-variant dark:text-command-subtle">
              <input
                type="checkbox"
                checked={locationConsent}
                onChange={(e) => setLocationConsent(e.target.checked)}
                className="mt-0.5 rounded border-surface-container-high text-secondary focus:ring-secondary"
              />
              <span>
                I consent to the use of GPS coordinates exclusively during active emergency SOS requests for search and rescue triage.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-secondary hover:bg-red-700 disabled:bg-slate-400 text-white rounded-xl font-headline text-sm font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all mt-3"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Creating Account...</span>
              </span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-surface-container dark:border-command-border text-center">
          <p className="text-xs text-on-surface-variant dark:text-command-subtle">
            Already registered?{' '}
            <Link href="/login" className="text-secondary dark:text-secondary-fixed font-bold hover:underline">
              Sign In to Your Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
