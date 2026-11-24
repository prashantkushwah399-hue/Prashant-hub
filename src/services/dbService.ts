import { get, push, ref, remove, set, update } from 'firebase/database';
import { rtdb } from '../firebase/config';
import type {
  Achievement,
  ChangelogEntry,
  ContactMessage,
  ContactSettings,
  CurrentlyWorkingItem,
  DocumentationPage,
  DownloadAsset,
  Goal,
  HomepageData,
  JourneyMilestone,
  ProfileData,
  Project,
  ProjectActivity,
  Release,
  SocialLink,
  UpdatePost,
  WebsiteSettings,
} from '../types/models';
import { nowIso } from '../utils/formatters';

export const DEFAULT_HERO_IMAGE_URL =
  '/src/assets/images/hero_architectural_surface_1795451048724.jpg';

export const DEFAULT_HOMEPAGE: HomepageData = {
  heroTitle: 'PRASHANT KUSHWAH',
  heroTagline: 'Learning. Building. Improving.',
  heroIntro: 'I explore technology, build projects, experiment with ideas, and continuously learn.',
  heroImageUrl: DEFAULT_HERO_IMAGE_URL,
  heroImageAlt: 'Minimalist architectural slate and brushed aluminum surface',
  primaryCtaLabel: 'Explore Projects',
  secondaryCtaLabel: 'My Journey',
  tertiaryCtaLabel: 'Contact',
  showFeaturedProjects: true,
  showCurrentlyWorking: true,
  showJourneyPreview: true,
  showGoalsPreview: true,
  showLatestUpdates: true,
  showSocialLinks: true,
};

export const DEFAULT_PROFILE: ProfileData = {
  fullName: 'Prashant Kushwah',
  headline: '',
  location: '',
  aboutMe: '',
  interests: '',
  whatImLearning: '',
  whatImBuilding: '',
  myVision: '',
};

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  siteTitle: 'Prashant Kushwah',
  siteDescription:
    'Personal technology platform, software project repository hub, journey tracker, and updates.',
  defaultTheme: 'dark',
  footerText: 'Prashant Kushwah — Personal Platform & Project Hub',
  showAchievementsLink: true,
  showSearchLink: true,
  featuredProjectIds: [],
};

export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  formEnabled: true,
  publicEmail: '',
  responseNotice: 'Messages are stored securely and reviewed directly.',
  availabilityNote: '',
};

function recordToList<T extends { id: string }>(val: unknown): T[] {
  if (!val || typeof val !== 'object') return [];
  return Object.entries(val as Record<string, Record<string, unknown>>).map(([id, item]) => ({
    ...(item as T),
    id,
  }));
}

function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
  }
  if (val && typeof val === 'object') {
    return Object.values(val as Record<string, unknown>).filter(
      (v): v is string => typeof v === 'string' && v.trim().length > 0
    );
  }
  return [];
}

function normalizeProject(raw: Partial<Project> & { id: string }): Project {
  return {
    id: raw.id,
    name: raw.name || 'Untitled Project',
    slug: raw.slug || raw.id,
    logoUrl: raw.logoUrl || '',
    bannerUrl: raw.bannerUrl || '',
    shortDescription: raw.shortDescription || '',
    detailedDescription: raw.detailedDescription || '',
    category: raw.category || 'Software',
    tags: toStringArray(raw.tags),
    status: raw.status || 'active',
    featured: Boolean(raw.featured),
    published: Boolean(raw.published),
    latestVersion: raw.latestVersion || '',
    features: toStringArray(raw.features),
    screenshots: toStringArray(raw.screenshots),
    externalLinks: raw.externalLinks || {},
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  };
}

export interface SiteDataset {
  profile: ProfileData;
  homepage: HomepageData;
  websiteSettings: WebsiteSettings;
  contactSettings: ContactSettings;
  projects: Project[];
  releases: Release[];
  assets: DownloadAsset[];
  changelog: ChangelogEntry[];
  documentation: DocumentationPage[];
  projectActivity: ProjectActivity[];
  journey: JourneyMilestone[];
  goals: Goal[];
  updates: UpdatePost[];
  currentlyWorking: CurrentlyWorkingItem[];
  achievements: Achievement[];
  socialLinks: SocialLink[];
  permissionWarning: string | null;
}

async function safeGet<T>(path: string, fallback: T): Promise<{ data: T; error: string | null }> {
  try {
    const snap = await get(ref(rtdb, path));
    if (!snap.exists()) return { data: fallback, error: null };
    return { data: snap.val() as T, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Database read error';
    return { data: fallback, error: msg };
  }
}

export async function fetchPublicDataset(): Promise<SiteDataset> {
  const [
    profileRes,
    homepageRes,
    settingsRes,
    contactSettingsRes,
    projectsRes,
    releasesRes,
    assetsRes,
    changelogRes,
    docsRes,
    activityRes,
    journeyRes,
    goalsRes,
    updatesRes,
    workingRes,
    achievementsRes,
    socialRes,
  ] = await Promise.all([
    safeGet<Partial<ProfileData>>('profile', {}),
    safeGet<Partial<HomepageData>>('homepage', {}),
    safeGet<Partial<WebsiteSettings>>('websiteSettings', {}),
    safeGet<Partial<ContactSettings>>('contactSettings', {}),
    safeGet<Record<string, unknown> | null>('projects', null),
    safeGet<Record<string, unknown> | null>('releases', null),
    safeGet<Record<string, unknown> | null>('assets', null),
    safeGet<Record<string, unknown> | null>('changelog', null),
    safeGet<Record<string, unknown> | null>('documentation', null),
    safeGet<Record<string, unknown> | null>('projectActivity', null),
    safeGet<Record<string, unknown> | null>('journey', null),
    safeGet<Record<string, unknown> | null>('goals', null),
    safeGet<Record<string, unknown> | null>('updates', null),
    safeGet<Record<string, unknown> | null>('currentlyWorking', null),
    safeGet<Record<string, unknown> | null>('achievements', null),
    safeGet<Record<string, unknown> | null>('socialLinks', null),
  ]);

  const errors = [
    profileRes.error,
    homepageRes.error,
    projectsRes.error,
    releasesRes.error,
  ].filter(Boolean);

  return {
    profile: { ...DEFAULT_PROFILE, ...profileRes.data },
    homepage: { ...DEFAULT_HOMEPAGE, ...homepageRes.data },
    websiteSettings: { ...DEFAULT_WEBSITE_SETTINGS, ...settingsRes.data },
    contactSettings: { ...DEFAULT_CONTACT_SETTINGS, ...contactSettingsRes.data },
    projects: recordToList<Project>(projectsRes.data)
      .map(normalizeProject)
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')),
    releases: recordToList<Release>(releasesRes.data).sort((a, b) =>
      (b.releaseDate || '').localeCompare(a.releaseDate || '')
    ),
    assets: recordToList<DownloadAsset>(assetsRes.data).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    ),
    changelog: recordToList<ChangelogEntry>(changelogRes.data).sort((a, b) =>
      (b.date || '').localeCompare(a.date || '')
    ),
    documentation: recordToList<DocumentationPage>(docsRes.data).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    ),
    projectActivity: recordToList<ProjectActivity>(activityRes.data).sort((a, b) =>
      (b.timestamp || '').localeCompare(a.timestamp || '')
    ),
    journey: recordToList<JourneyMilestone>(journeyRes.data).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    ),
    goals: recordToList<Goal>(goalsRes.data).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    updates: recordToList<UpdatePost>(updatesRes.data).sort((a, b) =>
      (b.date || '').localeCompare(a.date || '')
    ),
    currentlyWorking: recordToList<CurrentlyWorkingItem>(workingRes.data).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    ),
    achievements: recordToList<Achievement>(achievementsRes.data).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    ),
    socialLinks: recordToList<SocialLink>(socialRes.data).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    ),
    permissionWarning: errors.length > 0 ? errors[0] : null,
  };
}

// Singleton / Object nodes
export async function saveProfile(data: ProfileData): Promise<void> {
  await set(ref(rtdb, 'profile'), { ...data, updatedAt: nowIso() });
}

export async function saveHomepage(data: HomepageData): Promise<void> {
  await set(ref(rtdb, 'homepage'), { ...data, updatedAt: nowIso() });
}

export async function saveWebsiteSettings(data: WebsiteSettings): Promise<void> {
  await set(ref(rtdb, 'websiteSettings'), data);
}

export async function saveContactSettings(data: ContactSettings): Promise<void> {
  await set(ref(rtdb, 'contactSettings'), data);
}

// Generic list node CRUD
export async function createRecord<T extends Record<string, unknown>>(
  collection: string,
  payload: Omit<T, 'id'>
): Promise<string> {
  const newRef = push(ref(rtdb, collection));
  const id = newRef.key;
  if (!id) throw new Error('Failed to generate database key');
  await set(newRef, payload);
  return id;
}

export async function updateRecord<T extends Record<string, unknown>>(
  collection: string,
  id: string,
  payload: Partial<T>
): Promise<void> {
  await update(ref(rtdb, `${collection}/${id}`), payload);
}

export async function deleteRecord(collection: string, id: string): Promise<void> {
  await remove(ref(rtdb, `${collection}/${id}`));
}

// Project Activity logger (triggered strictly from genuine admin actions)
export async function logProjectActivity(
  projectId: string,
  type: string,
  title: string,
  description: string,
  source: 'manual' | 'system' = 'system'
): Promise<string> {
  return createRecord<Omit<ProjectActivity, 'id'>>('projectActivity', {
    projectId,
    type,
    title,
    description,
    timestamp: nowIso(),
    source,
  });
}

// Contact Messages
export async function submitContactMessage(
  payload: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>
): Promise<string> {
  return createRecord<Omit<ContactMessage, 'id'>>('contactMessages', {
    ...payload,
    createdAt: nowIso(),
    read: false,
  });
}

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const snap = await get(ref(rtdb, 'contactMessages'));
  if (!snap.exists()) return [];
  return recordToList<ContactMessage>(snap.val()).sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || '')
  );
}

// Batch reorder helper
export async function swapOrder(
  collection: string,
  first: { id: string; order: number },
  second: { id: string; order: number }
): Promise<void> {
  const updates: Record<string, number> = {};
  updates[`${collection}/${first.id}/order`] = second.order;
  updates[`${collection}/${second.id}/order`] = first.order;
  await update(ref(rtdb), updates);
}
