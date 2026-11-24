import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Activity,
  Award,
  BookOpen,
  Compass,
  ExternalLink,
  FileDiff,
  FolderGit2,
  HardDrive,
  Home,
  LayoutDashboard,
  Link2,
  LogOut,
  Mail,
  Menu,
  Moon,
  Newspaper,
  Package,
  Settings,
  Sun,
  Target,
  User,
  X,
} from 'lucide-react';
import {
  AdminHomepageSection,
  AdminProfileSection,
  AdminSettingsSection,
} from '../components/admin/AdminIdentitySections';
import { AdminOverviewSection } from '../components/admin/AdminOverviewSection';
import {
  AdminAchievementsSection,
  AdminCurrentlyWorkingSection,
  AdminGoalsSection,
  AdminJourneySection,
  AdminUpdatesSection,
} from '../components/admin/AdminPersonalSections';
import { AdminProjectsSection } from '../components/admin/AdminProjectsSection';
import {
  AdminAssetsSection,
  AdminReleasesSection,
} from '../components/admin/AdminReleasesSection';
import {
  AdminChangelogSection,
  AdminDocumentationSection,
  AdminProjectActivitySection,
} from '../components/admin/AdminChangelogDocsSection';
import {
  AdminContactMessagesSection,
  AdminSocialLinksSection,
} from '../components/admin/AdminSocialContactSection';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/formatters';

type AdminSectionKey =
  | 'overview'
  | 'profile'
  | 'homepage'
  | 'projects'
  | 'releases'
  | 'assets'
  | 'changelog'
  | 'documentation'
  | 'projectActivity'
  | 'journey'
  | 'goals'
  | 'updates'
  | 'currentlyWorking'
  | 'achievements'
  | 'socialLinks'
  | 'messages'
  | 'settings';

const NAV_ITEMS: Array<{ key: AdminSectionKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'homepage', label: 'Homepage', icon: Home },
  { key: 'projects', label: 'Projects', icon: FolderGit2 },
  { key: 'releases', label: 'Releases', icon: Package },
  { key: 'assets', label: 'Assets', icon: HardDrive },
  { key: 'changelog', label: 'Changelog', icon: FileDiff },
  { key: 'documentation', label: 'Documentation', icon: BookOpen },
  { key: 'projectActivity', label: 'Project Activity', icon: Activity },
  { key: 'journey', label: 'Journey', icon: Compass },
  { key: 'goals', label: 'Goals', icon: Target },
  { key: 'updates', label: 'Updates', icon: Newspaper },
  { key: 'currentlyWorking', label: 'Currently Working On', icon: Activity },
  { key: 'achievements', label: 'Achievements', icon: Award },
  { key: 'socialLinks', label: 'Social Links', icon: Link2 },
  { key: 'messages', label: 'Contact Messages', icon: Mail },
  { key: 'settings', label: 'Website Settings', icon: Settings },
];

export function AdminDashboardPage() {
  const { user, isAdmin, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminSectionKey>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = 'Admin Dashboard — Prashant Kushwah';
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0A0B0E] text-sm text-slate-500">
        Verifying administrator session...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/hubkaadmin/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const renderSection = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverviewSection onNavigateTab={(t) => setActiveTab(t as AdminSectionKey)} />;
      case 'profile':
        return <AdminProfileSection />;
      case 'homepage':
        return <AdminHomepageSection />;
      case 'projects':
        return <AdminProjectsSection />;
      case 'releases':
        return <AdminReleasesSection />;
      case 'assets':
        return <AdminAssetsSection />;
      case 'changelog':
        return <AdminChangelogSection />;
      case 'documentation':
        return <AdminDocumentationSection />;
      case 'projectActivity':
        return <AdminProjectActivitySection />;
      case 'journey':
        return <AdminJourneySection />;
      case 'goals':
        return <AdminGoalsSection />;
      case 'updates':
        return <AdminUpdatesSection />;
      case 'currentlyWorking':
        return <AdminCurrentlyWorkingSection />;
      case 'achievements':
        return <AdminAchievementsSection />;
      case 'socialLinks':
        return <AdminSocialLinksSection />;
      case 'messages':
        return <AdminContactMessagesSection />;
      case 'settings':
        return <AdminSettingsSection />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0A0B0E] text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] shrink-0">
        <div className="h-14 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
          <span className="font-display text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            Admin Console
          </span>
          <Link
            to="/"
            target="_blank"
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
            title="View public website"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Admin sections">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={cn(
                  'w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left',
                  active
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between gap-4 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-lg border border-slate-200 dark:border-slate-800 p-2 text-slate-700 dark:text-slate-300"
              aria-label="Open admin menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Admin / {NAV_ITEMS.find((i) => i.key === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
              {user.email}
            </span>
            <Link
              to="/"
              className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              View Site
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto">
          {renderSection()}
        </main>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-64 max-w-[80vw] bg-white dark:bg-[#111318] h-full flex flex-col border-r border-slate-200 dark:border-slate-800">
            <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
              <span className="font-display text-sm font-bold">Admin Console</span>
              <button type="button" onClick={() => setSidebarOpen(false)}>
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.key);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-left',
                      active
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'text-slate-600 dark:text-slate-400'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
