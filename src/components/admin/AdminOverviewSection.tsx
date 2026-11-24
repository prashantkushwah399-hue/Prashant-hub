import { useEffect, useState } from 'react';
import { ExternalLink, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteData } from '../../context/DataContext';
import { FIREBASE_DATABASE_URL, FIREBASE_PROJECT_ID } from '../../firebase/config';
import { fetchContactMessages } from '../../services/dbService';
import type { ContactMessage } from '../../types/models';
import { formatDateTime } from '../../utils/formatters';
import { AdminSectionHeader } from './AdminShared';

export function AdminOverviewSection({
  onNavigateTab,
}: {
  onNavigateTab: (tab: string) => void;
}) {
  const { dataset } = useSiteData();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [msgError, setMsgError] = useState<string | null>(null);

  useEffect(() => {
    fetchContactMessages()
      .then((list) => {
        setMessages(list);
        setMsgError(null);
      })
      .catch((err) => {
        setMsgError(err instanceof Error ? err.message : 'Unable to read messages');
      });
  }, []);

  const unreadCount = messages.filter((m) => !m.read).length;

  const stats = [
    {
      label: 'Projects',
      value: dataset.projects.length,
      sub: `${dataset.projects.filter((p) => p.published).length} published`,
      tab: 'projects',
    },
    {
      label: 'Releases',
      value: dataset.releases.length,
      sub: `${dataset.assets.length} assets`,
      tab: 'releases',
    },
    {
      label: 'Documentation',
      value: dataset.documentation.length,
      sub: `${dataset.documentation.filter((d) => d.published).length} published`,
      tab: 'documentation',
    },
    {
      label: 'Journey & Goals',
      value: dataset.journey.length + dataset.goals.length,
      sub: `${dataset.journey.length} milestones · ${dataset.goals.length} goals`,
      tab: 'journey',
    },
    {
      label: 'Updates',
      value: dataset.updates.length,
      sub: `${dataset.updates.filter((u) => u.published).length} published`,
      tab: 'updates',
    },
    {
      label: 'Messages',
      value: messages.length,
      sub: `${unreadCount} unread`,
      tab: 'messages',
    },
  ];

  return (
    <div className="space-y-8">
      <AdminSectionHeader
        title="Overview"
        description={`Real-time summary from Firebase project "${FIREBASE_PROJECT_ID}".`}
        action={
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span>Open Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {/* Real Database Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onNavigateTab(s.tab)}
            className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">{s.sub}</p>
          </button>
        ))}
      </div>

      {/* Auth & Database Connection Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Active Session & Database</span>
          </div>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Admin Email</dt>
              <dd className="font-medium text-slate-800 dark:text-slate-200">{user?.email}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Admin UID</dt>
              <dd className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                {user?.uid}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Realtime DB</dt>
              <dd className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                {FIREBASE_DATABASE_URL.replace('https://', '')}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Recent Messages</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('messages')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4"
            >
              Manage all
            </button>
          </div>

          {msgError ? (
            <p className="text-xs text-amber-600 dark:text-amber-400">{msgError}</p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No contact messages received yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {messages.slice(0, 4).map((msg) => (
                <li key={msg.id} className="py-2 text-xs flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {!msg.read && <span className="text-blue-500 mr-1.5">●</span>}
                      {msg.subject}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 truncate">
                      {msg.name} ({msg.email})
                    </p>
                  </div>
                  <span className="font-mono tabular-nums text-[11px] text-slate-400 shrink-0">
                    {formatDateTime(msg.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
