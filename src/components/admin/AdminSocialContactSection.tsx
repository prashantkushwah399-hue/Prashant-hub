import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  MailOpen,
  Pencil,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useSiteData } from '../../context/DataContext';
import {
  createRecord,
  deleteRecord,
  fetchContactMessages,
  saveContactSettings,
  swapOrder,
  updateRecord,
} from '../../services/dbService';
import type {
  ContactMessage,
  ContactSettings,
  SocialLink,
  SocialPlatform,
} from '../../types/models';
import { formatDateTime, isValidExternalUrl } from '../../utils/formatters';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import {
  AdminField,
  AdminInput,
  AdminSectionHeader,
  AdminSelect,
  AdminToggle,
  FeedbackBanner,
} from './AdminShared';

export function AdminSocialLinksSection() {
  const { dataset, refresh } = useSiteData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SocialLink | null>(null);

  const [form, setForm] = useState({
    platform: 'GitHub' as SocialPlatform,
    displayName: '',
    username: '',
    url: '',
    visible: true,
    order: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!isValidExternalUrl(form.url)) {
      setFeedback({ type: 'error', msg: 'Enter a valid URL starting with https:// or http://.' });
      return;
    }
    setSaving(true);
    try {
      const payload: Omit<SocialLink, 'id'> = {
        platform: form.platform,
        displayName: form.displayName.trim() || form.platform,
        username: form.username.trim(),
        url: form.url.trim(),
        icon: form.platform.toLowerCase(),
        visible: form.visible,
        order: Number(form.order) || 0,
      };
      if (editingId) {
        await updateRecord('socialLinks', editingId, payload);
      } else {
        await createRecord('socialLinks', payload);
      }
      await refresh();
      setShowForm(false);
      setFeedback({ type: 'success', msg: 'Social link saved.' });
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const a = dataset.socialLinks[idx];
    const b = dataset.socialLinks[idx + dir];
    if (!a || !b) return;
    await swapOrder(
      'socialLinks',
      { id: a.id, order: a.order ?? idx },
      { id: b.id, order: b.order ?? idx + dir }
    );
    await refresh();
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Social Links"
        description="Manage YouTube, Instagram, GitHub, Telegram, Discord, and custom platform links."
        action={
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({
                platform: 'GitHub',
                displayName: '',
                username: '',
                url: '',
                visible: true,
                order: dataset.socialLinks.length,
              });
              setShowForm(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Link</span>
          </button>
        }
      />
      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminField label="Platform">
              <AdminSelect
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value as SocialPlatform })}
              >
                <option value="GitHub">GitHub</option>
                <option value="YouTube">YouTube</option>
                <option value="Instagram">Instagram</option>
                <option value="Telegram">Telegram</option>
                <option value="Discord">Discord</option>
                <option value="X">X</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Website">Website</option>
                <option value="Custom">Custom</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="Display Name">
              <AdminInput
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="GitHub"
              />
            </AdminField>
            <AdminField label="Username / Handle">
              <AdminInput
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="@username"
              />
            </AdminField>
          </div>
          <AdminField label="Profile URL (https://)">
            <AdminInput
              required
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://github.com/..."
            />
          </AdminField>
          <AdminToggle
            label="Visible on Public Site"
            checked={form.visible}
            onChange={(v) => setForm({ ...form, visible: v })}
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-medium text-white dark:text-slate-900"
            >
              {saving ? 'Saving...' : 'Save Link'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] divide-y divide-slate-100 dark:divide-slate-800">
        {dataset.socialLinks.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No social links configured yet.</p>
        ) : (
          dataset.socialLinks.map((link, idx) => (
            <div key={link.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                  {link.displayName || link.platform}{' '}
                  {link.username && (
                    <span className="font-normal text-xs text-slate-500">({link.username})</span>
                  )}
                  {!link.visible && <span className="text-xs text-amber-500"> · Hidden</span>}
                </p>
                <p className="text-xs font-mono text-slate-500 truncate">{link.url}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => move(idx, -1)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5 disabled:opacity-30"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === dataset.socialLinks.length - 1}
                  onClick={() => move(idx, 1)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5 disabled:opacity-30"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await updateRecord('socialLinks', link.id, { visible: !link.visible });
                    await refresh();
                  }}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5"
                >
                  {link.visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(link.id);
                    setForm({
                      platform: link.platform,
                      displayName: link.displayName,
                      username: link.username,
                      url: link.url,
                      visible: link.visible,
                      order: link.order,
                    });
                    setShowForm(true);
                  }}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(link)}
                  className="rounded-lg border border-red-200 dark:border-red-900/50 p-1.5 text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Social Link"
        description={`Remove "${deleteTarget?.displayName || deleteTarget?.platform}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteRecord('socialLinks', deleteTarget.id);
          await refresh();
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export function AdminContactMessagesSection() {
  const { dataset, refresh } = useSiteData();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);

  const [settings, setSettings] = useState<ContactSettings>(dataset.contactSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const list = await fetchContactMessages();
      setMessages(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMessages();
  }, []);

  useEffect(() => {
    setSettings(dataset.contactSettings);
  }, [dataset.contactSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setFeedback(null);
    try {
      await saveContactSettings(settings);
      await refresh();
      setFeedback({ type: 'success', msg: 'Contact settings saved.' });
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-8">
      <AdminSectionHeader
        title="Contact Messages & Settings"
        description="Review messages submitted through the public Contact form and configure contact preferences."
      />

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      {/* Contact Settings */}
      <form
        onSubmit={handleSaveSettings}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 space-y-4"
      >
        <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
          Contact Preferences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminField label="Public Email (Optional)">
            <AdminInput
              type="email"
              value={settings.publicEmail}
              onChange={(e) => setSettings({ ...settings, publicEmail: e.target.value })}
              placeholder="Leave blank to keep email private"
            />
          </AdminField>
          <AdminField label="Response Notice">
            <AdminInput
              value={settings.responseNotice}
              onChange={(e) => setSettings({ ...settings, responseNotice: e.target.value })}
            />
          </AdminField>
        </div>
        <AdminField label="Availability Note (Optional)">
          <AdminInput
            value={settings.availabilityNote}
            onChange={(e) => setSettings({ ...settings, availabilityNote: e.target.value })}
          />
        </AdminField>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <AdminToggle
            label="Enable Contact Form"
            checked={settings.formEnabled}
            onChange={(v) => setSettings({ ...settings, formEnabled: v })}
          />
          <button
            type="submit"
            disabled={savingSettings}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingSettings ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Inbox */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] divide-y divide-slate-100 dark:divide-slate-800">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading messages...</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-500">{error}</p>
        ) : messages.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No contact messages received yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {msg.name}
                    </span>
                    <span>({msg.email})</span>
                    {!msg.read && (
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        · Unread
                      </span>
                    )}
                  </div>
                  <h4 className="mt-1 font-display text-sm font-semibold text-slate-900 dark:text-white">
                    {msg.subject}
                  </h4>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs tabular-nums text-slate-400">
                    {formatDateTime(msg.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await updateRecord('contactMessages', msg.id, { read: !msg.read });
                      await loadMessages();
                    }}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 inline-flex items-center gap-1"
                  >
                    {msg.read ? <MailOpen className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                    <span>{msg.read ? 'Mark Unread' : 'Mark Read'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(msg)}
                    className="rounded-lg border border-red-200 dark:border-red-900/50 p-1.5 text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {msg.message}
              </p>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Message"
        description={`Delete message "${deleteTarget?.subject}" from ${deleteTarget?.name}?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteRecord('contactMessages', deleteTarget.id);
          await loadMessages();
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
