import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useSiteData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';

export function Footer() {
  const { dataset } = useSiteData();
  const { theme, toggleTheme } = useTheme();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0A0B0E]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              {dataset.websiteSettings.footerText || 'Prashant Kushwah'}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {dataset.homepage.heroTagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600 dark:text-slate-400">
            <Link to="/projects" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Projects
            </Link>
            <Link to="/journey" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Journey
            </Link>
            <Link to="/goals" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Goals
            </Link>
            <Link to="/updates" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Updates
            </Link>
            <Link to="/search" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Search
            </Link>
            <Link to="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Contact
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
          <span className="tabular-nums">© {year} Prashant Kushwah</span>
        </div>
      </div>
    </footer>
  );
}
