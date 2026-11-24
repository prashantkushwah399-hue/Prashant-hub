import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, Lock, LogOut, RefreshCw, ShieldAlert } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';
import { useAuth } from '../context/AuthContext';

export function AdminLoginPage() {
  const { user, isAdmin, loading, authError, login, logout, recheckAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/hubkaadmin', { replace: true });
    }
  }, [loading, user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (!res.ok) {
      setLocalError(res.error || 'Authentication failed.');
      return;
    }

    if (res.isAdmin) {
      navigate('/hubkaadmin', { replace: true });
    }
  };

  const handleCopyUid = async () => {
    if (!user?.uid) return;
    try {
      await navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 1800);
    } catch {
      // ignore
    }
  };

  const handleRecheck = async () => {
    setChecking(true);
    const ok = await recheckAdmin();
    setChecking(false);
    if (ok) {
      navigate('/hubkaadmin', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-slate-50 dark:bg-[#0A0B0E] px-4 py-12">
      <div className="mx-auto w-full max-w-md space-y-6">
        <BackButton fallbackTo="/" />

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#171A21] text-slate-900 dark:text-white">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Platform Administration
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authenticated via Firebase Authentication
              </p>
            </div>
          </div>

          {/* Authenticated user without /admins/{uid} authorization */}
          {user && !isAdmin ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Admin Authorization Required</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-200/80">
                  Signed in as <span className="font-medium">{user.email}</span>, but this UID is
                  not authorized in Realtime Database under{' '}
                  <code className="font-mono">/admins/{user.uid}</code>.
                </p>
                {authError && (
                  <p className="text-[11px] font-mono text-red-600 dark:text-red-400">
                    {authError}
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0B0E] p-3 space-y-2">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Your Firebase UID
                </p>
                <div className="flex items-center justify-between gap-2">
                  <code className="font-mono text-xs text-slate-900 dark:text-slate-100 truncate">
                    {user.uid}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyUid}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 shrink-0"
                  >
                    {copiedUid ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUid ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  In Firebase Console → Realtime Database, add node{' '}
                  <code className="font-mono">admins/{user.uid}: true</code> and publish{' '}
                  <code className="font-mono">database.rules.json</code>.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRecheck}
                  disabled={checking}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-4 py-2.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                  <span>{checking ? 'Verifying...' : 'Verify Access'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Admin Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0B0E] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0B0E] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {(localError || authError) && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-3.5 py-2.5 text-xs text-red-700 dark:text-red-300"
                >
                  {localError || authError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-slate-900 dark:bg-white px-4 py-2.5 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
