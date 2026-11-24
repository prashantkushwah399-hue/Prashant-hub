import React, { useState } from 'react';
import { CheckCircle2, Mail, Send } from 'lucide-react';
import { useSiteData } from '../context/DataContext';
import { submitContactMessage } from '../services/dbService';
import { isValidEmail } from '../utils/formatters';

const COOLDOWN_KEY = 'pk_contact_last_sent';
const COOLDOWN_MS = 60_000;

export function ContactPage() {
  const { dataset } = useSiteData();
  const { contactSettings } = dataset;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Honeypot spam trap
    if (honeypot.trim().length > 0) {
      setSent(true);
      return;
    }

    if (!contactSettings.formEnabled) {
      setError('The contact form is currently disabled.');
      return;
    }

    // Cooldown spam check
    try {
      const last = Number(sessionStorage.getItem(COOLDOWN_KEY) || '0');
      if (Date.now() - last < COOLDOWN_MS) {
        setError('Please wait a minute before sending another message.');
        return;
      }
    } catch {
      // ignore sessionStorage errors
    }

    if (!name.trim() || name.trim().length > 120) {
      setError('Please enter your name (1–120 characters).');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!subject.trim() || subject.trim().length > 200) {
      setError('Please enter a subject (1–200 characters).');
      return;
    }
    if (message.trim().length < 5 || message.trim().length > 5000) {
      setError('Message must be between 5 and 5000 characters.');
      return;
    }

    setLoading(true);
    try {
      await submitContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      try {
        sessionStorage.setItem(COOLDOWN_KEY, String(Date.now()));
      } catch {
        // ignore
      }
      setSent(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to send message right now. Please verify Firebase Realtime Database rules.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-8">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Get in Touch</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Contact
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-2xl">
          Send a message regarding software projects, collaboration, or general inquiries.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {sent ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-8 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                Message sent
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Thank you for reaching out. Your message has been recorded securely.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 sm:p-8 space-y-5"
              noValidate
            >
              {/* Hidden honeypot field */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="contact-company">Company</label>
                <input
                  id="contact-company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0B0E] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0B0E] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Topic of your message"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0B0E] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={6}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0B0E] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-xs text-red-700 dark:text-red-300"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !contactSettings.formEnabled}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Direct Details</span>
            </div>

            {contactSettings.responseNotice && (
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {contactSettings.responseNotice}
              </p>
            )}

            {contactSettings.availabilityNote && (
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                {contactSettings.availabilityNote}
              </p>
            )}

            {contactSettings.publicEmail && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Public Contact</p>
                <a
                  href={`mailto:${contactSettings.publicEmail}`}
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 break-all"
                >
                  {contactSettings.publicEmail}
                </a>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
