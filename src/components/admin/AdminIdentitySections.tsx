import React, { useEffect, useState } from 'react';
import { Check, Copy, RotateCcw, Save } from 'lucide-react';
import { useSiteData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import {
  DEFAULT_HERO_IMAGE_URL,
  saveHomepage,
  saveProfile,
  saveWebsiteSettings,
} from '../../services/dbService';
import type { HomepageData, ProfileData, WebsiteSettings } from '../../types/models';
import { MediaFrame } from '../ui/MediaFrame';
import {
  AdminField,
  AdminInput,
  AdminSectionHeader,
  AdminSelect,
  AdminTextarea,
  AdminToggle,
  FeedbackBanner,
} from './AdminShared';

export function AdminProfileSection() {
  const { dataset, refresh } = useSiteData();
  const [form, setForm] = useState<ProfileData>(dataset.profile);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    setForm(dataset.profile);
  }, [dataset.profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await saveProfile(form);
      await refresh();
      setFeedback({ type: 'success', msg: 'Profile updated in Realtime Database.' });
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to save profile',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <AdminSectionHeader
        title="Profile & About Content"
        description="Controls the public About page sections. Supports Markdown formatting."
      />

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AdminField label="Full Name">
            <AdminInput
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Prashant Kushwah"
            />
          </AdminField>
          <AdminField label="Headline / Role">
            <AdminInput
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              placeholder="Software Builder & Learner"
            />
          </AdminField>
          <AdminField label="Location">
            <AdminInput
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Optional"
            />
          </AdminField>
        </div>

        <AdminField label="About Me">
          <AdminTextarea
            rows={4}
            value={form.aboutMe}
            onChange={(e) => setForm({ ...form, aboutMe: e.target.value })}
            placeholder="Write a concise introduction about yourself..."
          />
        </AdminField>

        <AdminField label="My Interests">
          <AdminTextarea
            rows={3}
            value={form.interests}
            onChange={(e) => setForm({ ...form, interests: e.target.value })}
          />
        </AdminField>

        <AdminField label="What I'm Learning">
          <AdminTextarea
            rows={3}
            value={form.whatImLearning}
            onChange={(e) => setForm({ ...form, whatImLearning: e.target.value })}
          />
        </AdminField>

        <AdminField label="What I'm Building">
          <AdminTextarea
            rows={3}
            value={form.whatImBuilding}
            onChange={(e) => setForm({ ...form, whatImBuilding: e.target.value })}
          />
        </AdminField>

        <AdminField label="My Vision">
          <AdminTextarea
            rows={3}
            value={form.myVision}
            onChange={(e) => setForm({ ...form, myVision: e.target.value })}
          />
        </AdminField>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

export function AdminHomepageSection() {
  const { dataset, refresh } = useSiteData();
  const [form, setForm] = useState<HomepageData>(dataset.homepage);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    setForm(dataset.homepage);
  }, [dataset.homepage]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await saveHomepage(form);
      await refresh();
      setFeedback({ type: 'success', msg: 'Homepage configuration saved.' });
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to save homepage',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <AdminSectionHeader
        title="Homepage Content"
        description="Customize Hero copy, CTA labels, and homepage section visibility."
      />

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminField label="Hero Title">
            <AdminInput
              value={form.heroTitle}
              onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
            />
          </AdminField>
          <AdminField label="Tagline">
            <AdminInput
              value={form.heroTagline}
              onChange={(e) => setForm({ ...form, heroTagline: e.target.value })}
            />
          </AdminField>
        </div>

        <AdminField label="Short Introduction">
          <AdminTextarea
            rows={3}
            value={form.heroIntro}
            onChange={(e) => setForm({ ...form, heroIntro: e.target.value })}
          />
        </AdminField>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AdminField label="Primary Button">
            <AdminInput
              value={form.primaryCtaLabel}
              onChange={(e) => setForm({ ...form, primaryCtaLabel: e.target.value })}
            />
          </AdminField>
          <AdminField label="Secondary Button">
            <AdminInput
              value={form.secondaryCtaLabel}
              onChange={(e) => setForm({ ...form, secondaryCtaLabel: e.target.value })}
            />
          </AdminField>
          <AdminField label="Tertiary Button">
            <AdminInput
              value={form.tertiaryCtaLabel}
              onChange={(e) => setForm({ ...form, tertiaryCtaLabel: e.target.value })}
            />
          </AdminField>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Homepage Hero / Banner Image
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Provide an external image URL (https://...) and preview it below before saving.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  heroImageUrl: DEFAULT_HERO_IMAGE_URL,
                  heroImageAlt: 'Minimalist architectural slate and brushed aluminum surface',
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 space-y-4">
              <AdminField
                label="Hero Image URL"
                hint="Supports https:// URLs or built-in /src/assets/images/... paths"
              >
                <AdminInput
                  value={form.heroImageUrl || ''}
                  onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
                  placeholder="https://example.com/hero-banner.jpg"
                />
              </AdminField>
              <AdminField label="Hero Image Alt Text">
                <AdminInput
                  value={form.heroImageAlt || ''}
                  onChange={(e) => setForm({ ...form, heroImageAlt: e.target.value })}
                  placeholder="Describe the hero banner image"
                />
              </AdminField>
            </div>

            <div className="lg:col-span-5 space-y-1.5">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Live Preview</p>
              <MediaFrame
                src={form.heroImageUrl || DEFAULT_HERO_IMAGE_URL}
                alt={form.heroImageAlt || 'Hero banner preview'}
                fallbackLabel="Invalid or unreachable image URL"
                aspectClassName="aspect-[4/3]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <p className="text-xs font-semibold text-slate-900 dark:text-white">
            Visible Homepage Sections
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AdminToggle
              label="Featured Projects"
              checked={form.showFeaturedProjects}
              onChange={(v) => setForm({ ...form, showFeaturedProjects: v })}
            />
            <AdminToggle
              label="Currently Working On"
              checked={form.showCurrentlyWorking}
              onChange={(v) => setForm({ ...form, showCurrentlyWorking: v })}
            />
            <AdminToggle
              label="Journey Preview"
              checked={form.showJourneyPreview}
              onChange={(v) => setForm({ ...form, showJourneyPreview: v })}
            />
            <AdminToggle
              label="Goals Preview"
              checked={form.showGoalsPreview}
              onChange={(v) => setForm({ ...form, showGoalsPreview: v })}
            />
            <AdminToggle
              label="Latest Updates"
              checked={form.showLatestUpdates}
              onChange={(v) => setForm({ ...form, showLatestUpdates: v })}
            />
            <AdminToggle
              label="Social Links"
              checked={form.showSocialLinks}
              onChange={(v) => setForm({ ...form, showSocialLinks: v })}
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Homepage'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

export function AdminSettingsSection() {
  const { dataset, refresh } = useSiteData();
  const { setTheme } = useTheme();
  const [form, setForm] = useState<WebsiteSettings>(dataset.websiteSettings);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [copiedRules, setCopiedRules] = useState(false);

  useEffect(() => {
    setForm(dataset.websiteSettings);
  }, [dataset.websiteSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await saveWebsiteSettings(form);
      setTheme(form.defaultTheme);
      await refresh();
      setFeedback({ type: 'success', msg: 'Website settings updated.' });
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to save website settings',
      });
    } finally {
      setSaving(false);
    }
  };

  const sampleRules = `See /database.rules.json in the repository root and publish it in Firebase Console → Realtime Database → Rules.`;

  const copyInstruction = async () => {
    try {
      await navigator.clipboard.writeText(sampleRules);
      setCopiedRules(true);
      setTimeout(() => setCopiedRules(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Website Settings"
        description="Global site metadata, default theme, footer copy, and navigation preferences."
      />

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      <form
        onSubmit={handleSave}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminField label="Website Title">
            <AdminInput
              value={form.siteTitle}
              onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
            />
          </AdminField>

          <AdminField label="Default Theme">
            <AdminSelect
              value={form.defaultTheme}
              onChange={(e) =>
                setForm({ ...form, defaultTheme: e.target.value as WebsiteSettings['defaultTheme'] })
              }
            >
              <option value="dark">Dark (Default)</option>
              <option value="light">Light</option>
            </AdminSelect>
          </AdminField>
        </div>

        <AdminField label="Website Description">
          <AdminTextarea
            rows={2}
            value={form.siteDescription}
            onChange={(e) => setForm({ ...form, siteDescription: e.target.value })}
          />
        </AdminField>

        <AdminField label="Footer Text">
          <AdminInput
            value={form.footerText}
            onChange={(e) => setForm({ ...form, footerText: e.target.value })}
          />
        </AdminField>

        <div className="flex flex-wrap gap-6 pt-2">
          <AdminToggle
            label="Show Achievements in More Menu"
            checked={form.showAchievementsLink}
            onChange={(v) => setForm({ ...form, showAchievementsLink: v })}
          />
          <AdminToggle
            label="Show Search in More Menu"
            checked={form.showSearchLink}
            onChange={(v) => setForm({ ...form, showSearchLink: v })}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
            Firebase Security Rules Reminder
          </h3>
          <button
            type="button"
            onClick={copyInstruction}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            {copiedRules ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRules ? 'Copied' : 'Copy note'}</span>
          </button>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Ensure <code className="font-mono">database.rules.json</code> is deployed in Firebase
          Console → Realtime Database → Rules, and your Admin UID is set to{' '}
          <code className="font-mono">true</code> under <code className="font-mono">/admins/&lt;UID&gt;</code>.
        </p>
      </div>
    </div>
  );
}
