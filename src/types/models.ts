export type ThemeMode = 'dark' | 'light';

export type ProjectStatus = 'featured' | 'active' | 'experimental' | 'archived';

export type ReleaseType = 'stable' | 'beta' | 'experimental';

export type ChangelogCategory = 'Added' | 'Improved' | 'Fixed' | 'Removed' | 'Security';

export type GoalCategory = 'Active' | 'Upcoming' | 'Completed';

export type UpdateCategory =
  | 'Development'
  | 'Experiments'
  | 'Learning'
  | 'Announcements'
  | 'Project Updates';

export type HostingProvider = 'MediaFire' | 'Google Drive' | 'GitHub' | 'Direct' | 'Other';

export type DocumentationCategory =
  | 'Getting Started'
  | 'Installation'
  | 'Features'
  | 'Configuration'
  | 'Usage'
  | 'Troubleshooting'
  | 'FAQ';

export type SocialPlatform =
  | 'YouTube'
  | 'Instagram'
  | 'GitHub'
  | 'Telegram'
  | 'Discord'
  | 'X'
  | 'LinkedIn'
  | 'Website'
  | 'Custom';

export interface ProfileData {
  fullName: string;
  headline: string;
  location: string;
  aboutMe: string;
  interests: string;
  whatImLearning: string;
  whatImBuilding: string;
  myVision: string;
  updatedAt?: string;
}

export interface HomepageData {
  heroTitle: string;
  heroTagline: string;
  heroIntro: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  tertiaryCtaLabel: string;
  showFeaturedProjects: boolean;
  showCurrentlyWorking: boolean;
  showJourneyPreview: boolean;
  showGoalsPreview: boolean;
  showLatestUpdates: boolean;
  showSocialLinks: boolean;
  updatedAt?: string;
}

export interface ProjectExternalLinks {
  github?: string;
  website?: string;
  demo?: string;
  docs?: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  bannerUrl: string;
  shortDescription: string;
  detailedDescription: string;
  category: string;
  tags: string[];
  status: ProjectStatus;
  featured: boolean;
  published: boolean;
  latestVersion: string;
  features: string[];
  screenshots: string[];
  externalLinks: ProjectExternalLinks;
  createdAt: string;
  updatedAt: string;
}

export interface Release {
  id: string;
  projectId: string;
  title: string;
  version: string;
  releaseDate: string;
  releaseType: ReleaseType;
  versionTag: string;
  description: string;
  notes: string;
  isLatest: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DownloadAsset {
  id: string;
  projectId: string;
  releaseId: string;
  name: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  version?: string;
  provider: HostingProvider;
  downloadUrl: string;
  description: string;
  order: number;
}

export interface ChangelogEntry {
  id: string;
  projectId: string;
  releaseId: string;
  version: string;
  category: ChangelogCategory;
  description: string;
  date: string;
  published: boolean;
}

export interface DocumentationPage {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  category: DocumentationCategory | string;
  content: string;
  order: number;
  published: boolean;
  updatedAt: string;
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  source: 'manual' | 'system';
}

export interface JourneyMilestone {
  id: string;
  title: string;
  date: string;
  description: string;
  category: string;
  imageUrl: string;
  projectId: string;
  order: number;
  published: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  status: string;
  targetDate: string;
  progress: number | null;
  projectId: string;
  order: number;
  published: boolean;
}

export interface UpdatePost {
  id: string;
  title: string;
  content: string;
  date: string;
  category: UpdateCategory | string;
  imageUrl: string;
  projectId: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentlyWorkingItem {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: string;
  lastUpdated: string;
  order: number;
  published: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  imageUrl: string;
  projectId: string;
  order: number;
  published: boolean;
}

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  displayName: string;
  username: string;
  url: string;
  icon: string;
  visible: boolean;
  order: number;
}

export interface ContactSettings {
  formEnabled: boolean;
  publicEmail: string;
  responseNotice: string;
  availabilityNote: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface WebsiteSettings {
  siteTitle: string;
  siteDescription: string;
  defaultTheme: ThemeMode;
  footerText: string;
  showAchievementsLink: boolean;
  showSearchLink: boolean;
  featuredProjectIds: string[];
}
