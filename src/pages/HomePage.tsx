import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  ExternalLink,
  FolderGit2,
  GitBranch,
  Layers,
  Mail,
  Target,
} from 'lucide-react';
import { SocialIcon } from '../components/common/SocialIcon';
import { ProjectCard } from '../components/projects/ProjectCard';
import { EmptyState } from '../components/ui/EmptyState';
import { MediaFrame } from '../components/ui/MediaFrame';
import { useSiteData } from '../context/DataContext';
import { DEFAULT_HERO_IMAGE_URL } from '../services/dbService';
import { formatDate, isValidExternalUrl } from '../utils/formatters';

export function HomePage() {
  const {
    dataset,
    loading,
    publishedProjects,
    publishedReleases,
    publishedDocs,
    publishedJourney,
    publishedGoals,
    publishedUpdates,
    publishedWorking,
    visibleSocialLinks,
  } = useSiteData();

  const { homepage } = dataset;

  const featuredProjects = publishedProjects
    .filter((p) => p.featured || p.status === 'featured')
    .slice(0, 4);
  const displayProjects =
    featuredProjects.length > 0 ? featuredProjects : publishedProjects.slice(0, 4);

  const previewWorking = publishedWorking.slice(0, 4);
  const previewJourney = publishedJourney.slice(0, 4);
  const previewGoals = publishedGoals
    .filter((g) => g.category === 'Active' || g.category === 'Upcoming')
    .slice(0, 3);
  const previewUpdates = publishedUpdates.slice(0, 3);

  const projectById = (id?: string) => publishedProjects.find((p) => p.id === id);

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12 sm:py-16 space-y-20">
      {/* Hero Split */}
      <section aria-labelledby="hero-heading">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center py-2">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 tracking-tight">
              {homepage.heroTagline}
            </p>
            <h1
              id="hero-heading"
              className="mt-3 font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.08] text-balance"
            >
              {homepage.heroTitle}
            </h1>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-xl">
              {homepage.heroIntro}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
              >
                <span>{homepage.primaryCtaLabel || 'Explore Projects'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/journey"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] px-5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
              >
                <span>{homepage.secondaryCtaLabel || 'My Journey'}</span>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#111318] transition-colors whitespace-nowrap shrink-0"
              >
                <Mail className="w-4 h-4" />
                <span>{homepage.tertiaryCtaLabel || 'Contact'}</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <MediaFrame
              src={homepage.heroImageUrl || DEFAULT_HERO_IMAGE_URL}
              alt={homepage.heroImageAlt || 'Minimalist architectural slate and brushed aluminum surface'}
              fallbackLabel="Prashant Kushwah Platform"
              aspectClassName="aspect-[4/3] lg:h-full"
              className="h-full"
            />
          </div>
        </div>

        {/* Real Live RTDB Summary Strip (no fake stats) */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-slate-200 dark:border-slate-800/80 py-5">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Published Projects</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
              {loading ? '—' : publishedProjects.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Software Releases</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
              {loading ? '—' : publishedReleases.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Journey Milestones</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
              {loading ? '—' : publishedJourney.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tracked Goals</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
              {loading ? '—' : publishedGoals.length}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {homepage.showFeaturedProjects !== false && (
        <section aria-labelledby="featured-projects-heading">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2
                id="featured-projects-heading"
                className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
              >
                Featured Projects
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Software repositories, releases, and documentation.
              </p>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              <span>Explore all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {displayProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayProjects.map((project) => {
                const rels = publishedReleases.filter((r) => r.projectId === project.id);
                const relIds = new Set(rels.map((r) => r.id));
                const assetsCount = dataset.assets.filter(
                  (a) => a.projectId === project.id && (!a.releaseId || relIds.has(a.releaseId))
                ).length;
                const docsCount = publishedDocs.filter((d) => d.projectId === project.id).length;

                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    releaseCount={rels.length}
                    assetCount={assetsCount}
                    docCount={docsCount}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<FolderGit2 className="w-5 h-5" />}
              title="No published projects yet"
              description="Projects added and published in the project hub will appear here."
              action={
                <Link
                  to="/projects"
                  className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Open Project Explorer
                </Link>
              }
            />
          )}
        </section>
      )}

      {/* Currently Working On */}
      {homepage.showCurrentlyWorking !== false && (
        <section aria-labelledby="working-heading">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2
                id="working-heading"
                className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
              >
                Currently Working On
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Active focus areas, experiments, and ongoing engineering tasks.
              </p>
            </div>
          </div>

          {previewWorking.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previewWorking.map((item) => {
                const linked = projectById(item.projectId);
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap shrink-0">
                        {item.status}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="tabular-nums">Updated {formatDate(item.lastUpdated)}</span>
                      {linked && (
                        <Link
                          to={`/projects/${linked.slug}`}
                          className="font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {linked.name}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Layers className="w-5 h-5" />}
              title="No active work logs published"
              description="Current activities and focus items published by Prashant will appear here."
            />
          )}
        </section>
      )}

      {/* Journey & Goals Previews Side by Side on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {homepage.showJourneyPreview !== false && (
          <section aria-labelledby="journey-preview-heading">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2
                  id="journey-preview-heading"
                  className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                  Journey Preview
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Recent milestones over time.
                </p>
              </div>
              <Link
                to="/journey"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
              >
                Full timeline
              </Link>
            </div>

            {previewJourney.length > 0 ? (
              <div className="space-y-4">
                {previewJourney.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-4"
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>{formatDate(m.date)}</span>
                      {m.category && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{m.category}</span>
                        </>
                      )}
                    </div>
                    <h3 className="mt-1.5 font-display text-base font-semibold text-slate-900 dark:text-white">
                      {m.title}
                    </h3>
                    {m.description && (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {m.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Compass className="w-5 h-5" />}
                title="No journey milestones yet"
                description="Published timeline milestones will be shown here."
              />
            )}
          </section>
        )}

        {homepage.showGoalsPreview !== false && (
          <section aria-labelledby="goals-preview-heading">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2
                  id="goals-preview-heading"
                  className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                  Goals Preview
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Active and upcoming objectives.
                </p>
              </div>
              <Link
                to="/goals"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
              >
                All goals
              </Link>
            </div>

            {previewGoals.length > 0 ? (
              <div className="space-y-4">
                {previewGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-4"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{goal.category}</span>
                      {goal.targetDate && (
                        <span className="tabular-nums">Target {formatDate(goal.targetDate)}</span>
                      )}
                    </div>
                    <h3 className="mt-1.5 font-display text-base font-semibold text-slate-900 dark:text-white">
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                    {typeof goal.progress === 'number' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                          <span>{goal.status || 'Progress'}</span>
                          <span className="font-mono tabular-nums">{goal.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Target className="w-5 h-5" />}
                title="No goals published yet"
                description="Active and upcoming personal goals will appear here."
              />
            )}
          </section>
        )}
      </div>

      {/* Latest Updates */}
      {homepage.showLatestUpdates !== false && (
        <section aria-labelledby="latest-updates-heading">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2
                id="latest-updates-heading"
                className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
              >
                Latest Updates
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Development notes, learning logs, and project announcements.
              </p>
            </div>
            <Link
              to="/updates"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              <span>All updates</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {previewUpdates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {previewUpdates.map((post) => (
                <Link
                  key={post.id}
                  to={`/updates/${post.id}`}
                  className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{formatDate(post.date)}</span>
                  </div>
                  <h3 className="mt-2 font-display text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                    {post.content.replace(/[#*`>]/g, '')}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<GitBranch className="w-5 h-5" />}
              title="No updates published yet"
              description="Personal updates and project announcements will appear here once published."
            />
          )}
        </section>
      )}

      {/* Social Links */}
      {homepage.showSocialLinks !== false && (
        <section aria-labelledby="social-links-heading">
          <div className="mb-6">
            <h2
              id="social-links-heading"
              className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Connect
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Official profiles and channels.
            </p>
          </div>

          {visibleSocialLinks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleSocialLinks
                .filter((s) => isValidExternalUrl(s.url))
                .map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] px-4 py-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#171A21] text-slate-700 dark:text-slate-300">
                        <SocialIcon platform={link.platform} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {link.displayName || link.platform}
                        </p>
                        {link.username && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {link.username}
                          </p>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 shrink-0 text-slate-400" />
                  </a>
                ))}
            </div>
          ) : (
            <EmptyState
              title="No social links configured"
              description="Social channels configured in the admin panel will appear here."
            />
          )}
        </section>
      )}
    </div>
  );
}
