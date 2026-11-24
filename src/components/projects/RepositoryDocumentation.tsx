import { useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import type { DocumentationPage } from '../../types/models';
import { cn, formatDate } from '../../utils/formatters';
import { EmptyState } from '../ui/EmptyState';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';

interface RepositoryDocumentationProps {
  pages: DocumentationPage[];
  selectedDocId: string | null;
  onSelectDoc: (id: string) => void;
}

export function RepositoryDocumentation({
  pages,
  selectedDocId,
  onSelectDoc,
}: RepositoryDocumentationProps) {
  const [query, setQuery] = useState('');

  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    );
  }, [pages, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, DocumentationPage[]>();
    filteredPages.forEach((page) => {
      const cat = page.category || 'General';
      const arr = map.get(cat) || [];
      arr.push(page);
      map.set(cat, arr);
    });
    return Array.from(map.entries());
  }, [filteredPages]);

  const activeDoc =
    pages.find((p) => p.id === selectedDocId) || filteredPages[0] || pages[0] || null;

  if (pages.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="w-5 h-5" />}
        title="No documentation published yet"
        description="Project documentation pages (Installation, Features, Usage, FAQ) will appear here."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Documentation Sidebar */}
      <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-4 space-y-4 lg:sticky lg:top-20">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter docs..."
              aria-label="Search project documentation"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0B0E] pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mobile selector */}
          <div className="lg:hidden">
            <select
              value={activeDoc?.id || ''}
              onChange={(e) => onSelectDoc(e.target.value)}
              aria-label="Select documentation page"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0B0E] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
            >
              {filteredPages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.category}: {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop grouped nav */}
          <nav className="hidden lg:block space-y-5" aria-label="Documentation sections">
            {grouped.length > 0 ? (
              grouped.map(([category, items]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 px-2">
                    {category}
                  </p>
                  <ul className="space-y-0.5">
                    {items.map((doc) => {
                      const active = activeDoc?.id === doc.id;
                      return (
                        <li key={doc.id}>
                          <button
                            type="button"
                            onClick={() => onSelectDoc(doc.id)}
                            className={cn(
                              'w-full text-left rounded-lg px-2.5 py-1.5 text-sm transition-colors truncate',
                              active
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                            )}
                          >
                            {doc.title}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 px-2">
                No matching documentation pages.
              </p>
            )}
          </nav>
        </div>
      </aside>

      {/* Documentation Content Reader */}
      <div className="lg:col-span-8 xl:col-span-9">
        {activeDoc ? (
          <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 sm:p-8">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {activeDoc.category}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
                  {activeDoc.title}
                </h2>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                Updated {formatDate(activeDoc.updatedAt)}
              </span>
            </div>

            <MarkdownRenderer content={activeDoc.content} />
          </article>
        ) : null}
      </div>
    </div>
  );
}
