import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_CONTACT_SETTINGS,
  DEFAULT_HOMEPAGE,
  DEFAULT_PROFILE,
  DEFAULT_WEBSITE_SETTINGS,
  fetchPublicDataset,
  type SiteDataset,
} from '../services/dbService';

interface DataContextValue {
  dataset: SiteDataset;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  publishedProjects: SiteDataset['projects'];
  publishedReleases: SiteDataset['releases'];
  publishedChangelog: SiteDataset['changelog'];
  publishedDocs: SiteDataset['documentation'];
  publishedJourney: SiteDataset['journey'];
  publishedGoals: SiteDataset['goals'];
  publishedUpdates: SiteDataset['updates'];
  publishedWorking: SiteDataset['currentlyWorking'];
  publishedAchievements: SiteDataset['achievements'];
  visibleSocialLinks: SiteDataset['socialLinks'];
}

const EMPTY_DATASET: SiteDataset = {
  profile: DEFAULT_PROFILE,
  homepage: DEFAULT_HOMEPAGE,
  websiteSettings: DEFAULT_WEBSITE_SETTINGS,
  contactSettings: DEFAULT_CONTACT_SETTINGS,
  projects: [],
  releases: [],
  assets: [],
  changelog: [],
  documentation: [],
  projectActivity: [],
  journey: [],
  goals: [],
  updates: [],
  currentlyWorking: [],
  achievements: [],
  socialLinks: [],
  permissionWarning: null,
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [dataset, setDataset] = useState<SiteDataset>(EMPTY_DATASET);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchPublicDataset();
      setDataset(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load platform data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (dataset.websiteSettings.siteTitle) {
      document.title = dataset.websiteSettings.siteTitle.includes('Prashant')
        ? dataset.websiteSettings.siteTitle
        : `${dataset.websiteSettings.siteTitle} — Prashant Kushwah`;
    }
  }, [dataset.websiteSettings.siteTitle]);

  const value = useMemo<DataContextValue>(
    () => ({
      dataset,
      loading,
      error,
      refresh,
      publishedProjects: dataset.projects.filter((p) => p.published),
      publishedReleases: dataset.releases.filter((r) => r.published),
      publishedChangelog: dataset.changelog.filter((c) => c.published),
      publishedDocs: dataset.documentation.filter((d) => d.published),
      publishedJourney: dataset.journey.filter((j) => j.published),
      publishedGoals: dataset.goals.filter((g) => g.published),
      publishedUpdates: dataset.updates.filter((u) => u.published),
      publishedWorking: dataset.currentlyWorking.filter((w) => w.published),
      publishedAchievements: dataset.achievements.filter((a) => a.published),
      visibleSocialLinks: dataset.socialLinks.filter((s) => s.visible),
    }),
    [dataset, loading, error, refresh]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useSiteData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useSiteData must be used within DataProvider');
  return ctx;
}
