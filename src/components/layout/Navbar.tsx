import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useSiteData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/formatters';

export function Navbar() {
  const { dataset } = useSiteData();
  const { theme, toggleTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 py-1',
      isActive
        ? 'text-slate-900 dark:text-white underline underline-offset-8 decoration-blue-600 dark:decoration-blue-400 decoration-2'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
    );

  const showAchievements = dataset.websiteSettings.showAchievementsLink !== false;
  const showSearch = dataset.websiteSettings.showSearchLink !== false;

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-[#0A0B0E]/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-8 px-4 sm:px-6">
        {/* Zone 1: Single text element Brand wordmark */}
        <Link
          to="/"
          className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
        >
          Prashant Kushwah
        </Link>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/journey" className={navLinkClass}>
            Journey
          </NavLink>
          <NavLink to="/goals" className={navLinkClass}>
            Goals
          </NavLink>
          <NavLink to="/projects" className={navLinkClass}>
            Projects
          </NavLink>
          <NavLink to="/updates" className={navLinkClass}>
            Updates
          </NavLink>

          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((prev) => !prev)}
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap shrink-0 py-1 transition-colors"
              aria-expanded={moreOpen}
            >
              <span>More</span>
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', moreOpen && 'rotate-180')} />
            </button>

            {moreOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-1.5 shadow-lg">
                {showAchievements && (
                  <Link
                    to="/achievements"
                    onClick={() => setMoreOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
                  >
                    Achievements
                  </Link>
                )}
                {showSearch && (
                  <Link
                    to="/search"
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Search className="w-3.5 h-3.5" />
                      Search Platform
                    </span>
                    <kbd className="font-mono text-[11px] text-slate-400">⌘K</kbd>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    toggleTheme();
                    setMoreOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/contact"
            className="hidden lg:inline-flex items-center justify-center rounded-lg bg-slate-900 dark:bg-white px-4 py-1.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Contact
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0B0E] px-4 py-4">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {[
              { to: '/', label: 'Home' },
              { to: '/about', label: 'About' },
              { to: '/journey', label: 'Journey' },
              { to: '/goals', label: 'Goals' },
              { to: '/projects', label: 'Projects' },
              { to: '/updates', label: 'Updates' },
              ...(showAchievements ? [{ to: '/achievements', label: 'Achievements' }] : []),
              ...(showSearch ? [{ to: '/search', label: 'Search' }] : []),
              { to: '/contact', label: 'Contact' },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Appearance</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
