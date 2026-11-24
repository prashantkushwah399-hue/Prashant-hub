import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BackButton } from '../ui/BackButton';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate('/search');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  const showBackBar = location.pathname !== '/';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#0A0B0E] dark:text-slate-100">
      <Navbar />
      <main className="flex-1">
        {showBackBar && (
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-5 sm:pt-6">
            <BackButton />
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
}
