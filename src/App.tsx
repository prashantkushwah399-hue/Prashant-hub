import { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { EmptyState } from './components/ui/EmptyState';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { AboutPage } from './pages/AboutPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { ContactPage } from './pages/ContactPage';
import { GoalsPage } from './pages/GoalsPage';
import { HomePage } from './pages/HomePage';
import { JourneyPage } from './pages/JourneyPage';
import { ProjectRepositoryPage } from './pages/ProjectRepositoryPage';
import { ProjectsExplorerPage } from './pages/ProjectsExplorerPage';
import { SearchPage } from './pages/SearchPage';
import { UpdateDetailPage } from './pages/UpdateDetailPage';
import { UpdatesPage } from './pages/UpdatesPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFoundPage() {
  return (
    <div className="mx-auto max-w-[800px] px-4 sm:px-6 py-20">
      <EmptyState
        title="Page not found"
        description="The requested route could not be found."
        action={
          <Link
            to="/"
            className="rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900"
          >
            Go Home
          </Link>
        }
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Direct Admin Routes (no public navbar) */}
              <Route path="/hubkaadmin/login" element={<AdminLoginPage />} />
              <Route path="/hubkaadmin" element={<AdminDashboardPage />} />

              {/* Public Platform Routes */}
              <Route
                path="/"
                element={
                  <PublicLayout>
                    <HomePage />
                  </PublicLayout>
                }
              />
              <Route
                path="/about"
                element={
                  <PublicLayout>
                    <AboutPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/journey"
                element={
                  <PublicLayout>
                    <JourneyPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/goals"
                element={
                  <PublicLayout>
                    <GoalsPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/projects"
                element={
                  <PublicLayout>
                    <ProjectsExplorerPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/projects/:slug"
                element={
                  <PublicLayout>
                    <ProjectRepositoryPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/updates"
                element={
                  <PublicLayout>
                    <UpdatesPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/updates/:id"
                element={
                  <PublicLayout>
                    <UpdateDetailPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/achievements"
                element={
                  <PublicLayout>
                    <AchievementsPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/search"
                element={
                  <PublicLayout>
                    <SearchPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/contact"
                element={
                  <PublicLayout>
                    <ContactPage />
                  </PublicLayout>
                }
              />
              <Route
                path="*"
                element={
                  <PublicLayout>
                    <NotFoundPage />
                  </PublicLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
