import { Link } from 'react-router-dom';
import { Award, BookOpen, Cpu, Compass, User } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { useSiteData } from '../context/DataContext';

export function AboutPage() {
  const { dataset, publishedAchievements } = useSiteData();
  const { profile } = dataset;

  const sections = [
    { id: 'about-me', title: 'About Me', content: profile.aboutMe, icon: User },
    { id: 'interests', title: 'My Interests', content: profile.interests, icon: Compass },
    {
      id: 'learning',
      title: "What I'm Learning",
      content: profile.whatImLearning,
      icon: BookOpen,
    },
    { id: 'building', title: "What I'm Building", content: profile.whatImBuilding, icon: Cpu },
    { id: 'vision', title: 'My Vision', content: profile.myVision, icon: Award },
  ];

  const hasAnyContent = sections.some((s) => s.content.trim().length > 0);

  return (
    <div className="mx-auto max-w-[1000px] px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-8">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Digital Identity</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          {profile.fullName || 'Prashant Kushwah'}
        </h1>
        {(profile.headline || profile.location) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            {profile.headline && <span>{profile.headline}</span>}
            {profile.headline && profile.location && <span aria-hidden="true">·</span>}
            {profile.location && <span>{profile.location}</span>}
          </div>
        )}
      </header>

      {hasAnyContent ? (
        <div className="space-y-8">
          {sections.map((section) => {
            if (!section.content.trim()) return null;
            const Icon = section.icon;
            return (
              <section
                key={section.id}
                aria-labelledby={section.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 sm:p-8"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2
                    id={section.id}
                    className="font-display text-xl font-semibold text-slate-900 dark:text-white"
                  >
                    {section.title}
                  </h2>
                </div>
                <MarkdownRenderer content={section.content} />
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Profile details not yet published"
          description="About Me, Interests, Learning, Building, and Vision sections can be edited and published from the admin dashboard."
        />
      )}

      {publishedAchievements.length > 0 && (
        <section className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
              Achievements
            </h2>
            <Link
              to="/achievements"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4"
            >
              View all ({publishedAchievements.length})
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {publishedAchievements.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-5"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.category}</p>
                <h3 className="mt-1 font-display text-base font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
