import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useSiteData } from '../../context/DataContext';
import {
  createRecord,
  deleteRecord,
  logProjectActivity,
  swapOrder,
  updateRecord,
} from '../../services/dbService';
import type {
  ChangelogCategory,
  ChangelogEntry,
  DocumentationCategory,
  DocumentationPage,
} from '../../types/models';
import { formatDate, nowIso, todayIsoDate, toSlug } from '../../utils/formatters';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import {
  AdminField,
  AdminInput,
  AdminSectionHeader,
  AdminSelect,
  AdminTextarea,
  AdminToggle,
  FeedbackBanner,
} from './AdminShared';

export function AdminChangelogSection() {
  const { dataset, refresh } = useSiteData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChangelogEntry | null>(null);

  const [form, setForm] = useState({
    projectId: dataset.projects[0]?.id || '',
    releaseId: '',
    version: '',
    category: 'Added' as ChangelogCategory,
    description: '',
    date: todayIsoDate(),
    published: true,
  });

  const releasesForProject = dataset.releases.filter((r) => r.projectId === form.projectId);

  const openCreate = () => {
    const pid = dataset.projects[0]?.id || '';
    const rel = dataset.releases.find((r) => r.projectId === pid);
    setEditingId(null);
    setForm({
      projectId: pid,
      releaseId: rel?.id || '',
      version: rel?.version || '',
      category: 'Added',
      description: '',
      date: todayIsoDate(),
      published: true,
    });
    setShowForm(true);
    setFeedback(null);
  };

  const openEdit = (entry: ChangelogEntry) => {
    setEditingId(entry.id);
    setForm({
      projectId: entry.projectId,
      releaseId: entry.releaseId || '',
      version: entry.version || '',
      category: entry.category,
      description: entry.description,
      date: entry.date || todayIsoDate(),
      published: entry.published,
    });
    setShowForm(true);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId || !form.description.trim()) {
      setFeedback({ type: 'error', msg: 'Project and changelog description are required.' });
      return;
    }
    setSaving(true);
    try {
      const payload: Omit<ChangelogEntry, 'id'> = {
        projectId: form.projectId,
        releaseId: form.releaseId,
        version: form.version.trim(),
        category: form.category,
        description: form.description.trim(),
        date: form.date,
        published: form.published,
      };
      if (editingId) {
        await updateRecord('changelog', editingId, payload);
        setFeedback({ type: 'success', msg: 'Changelog entry updated.' });
      } else {
        await createRecord('changelog', payload);
        setFeedback({ type: 'success', msg: 'Changelog entry created.' });
      }
      await refresh();
      setShowForm(false);
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Changelog"
        description="Structured Added, Improved, Fixed, Removed, and Security entries linked to projects and releases."
        action={
          <button
            type="button"
            disabled={dataset.projects.length === 0}
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900 disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        }
      />

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              {editingId ? 'Edit Changelog Entry' : 'New Changelog Entry'}
            </h3>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminField label="Project">
              <AdminSelect
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value, releaseId: '' })}
              >
                {dataset.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>

            <AdminField label="Release (Optional)">
              <AdminSelect
                value={form.releaseId}
                onChange={(e) => {
                  const relId = e.target.value;
                  const rel = releasesForProject.find((r) => r.id === relId);
                  setForm({
                    ...form,
                    releaseId: relId,
                    version: rel ? rel.version : form.version,
                  });
                }}
              >
                <option value="">— Unlinked —</option>
                {releasesForProject.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.version} — {r.title}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>

            <AdminField label="Version">
              <AdminInput
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                placeholder="v1.0.0"
              />
            </AdminField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminField label="Category">
              <AdminSelect
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as ChangelogCategory })}
              >
                <option value="Added">Added</option>
                <option value="Improved">Improved</option>
                <option value="Fixed">Fixed</option>
                <option value="Removed">Removed</option>
                <option value="Security">Security</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="Date">
              <AdminInput
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </AdminField>
          </div>

          <AdminField label="Description">
            <AdminTextarea
              rows={2}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what changed..."
            />
          </AdminField>

          <AdminToggle
            label="Published"
            checked={form.published}
            onChange={(v) => setForm({ ...form, published: v })}
          />

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-medium text-white dark:text-slate-900"
            >
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] divide-y divide-slate-100 dark:divide-slate-800">
        {dataset.changelog.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No changelog entries yet.</p>
        ) : (
          dataset.changelog.map((c) => {
            const proj = dataset.projects.find((p) => p.id === c.projectId);
            return (
              <div
                key={c.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {proj?.name || 'Project'}
                    </span>
                    <span>·</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{c.category}</span>
                    {c.version && <span>· {c.version}</span>}
                    {!c.published && <span className="text-amber-500">· Draft</span>}
                  </div>
                  <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{c.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(c)}
                    className="rounded-lg border border-red-200 dark:border-red-900/50 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Changelog Entry"
        description="Delete this changelog entry permanently?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteRecord('changelog', deleteTarget.id);
          await refresh();
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

const DOC_CATEGORIES: DocumentationCategory[] = [
  'Getting Started',
  'Installation',
  'Features',
  'Configuration',
  'Usage',
  'Troubleshooting',
  'FAQ',
];

export function AdminDocumentationSection() {
  const { dataset, refresh } = useSiteData();
  const [filterProjectId, setFilterProjectId] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocumentationPage | null>(null);

  const [form, setForm] = useState({
    projectId: dataset.projects[0]?.id || '',
    title: '',
    slug: '',
    category: 'Getting Started',
    content: '',
    order: 0,
    published: true,
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({
      projectId: filterProjectId !== 'all' ? filterProjectId : dataset.projects[0]?.id || '',
      title: '',
      slug: '',
      category: 'Getting Started',
      content: '',
      order: dataset.documentation.length,
      published: true,
    });
    setPreviewMode(false);
    setShowForm(true);
    setFeedback(null);
  };

  const openEdit = (doc: DocumentationPage) => {
    setEditingId(doc.id);
    setForm({
      projectId: doc.projectId,
      title: doc.title,
      slug: doc.slug,
      category: doc.category || 'Getting Started',
      content: doc.content,
      order: doc.order ?? 0,
      published: doc.published,
    });
    setPreviewMode(false);
    setShowForm(true);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId || !form.title.trim()) {
      setFeedback({ type: 'error', msg: 'Project and documentation title are required.' });
      return;
    }

    const now = nowIso();
    const payload: Omit<DocumentationPage, 'id'> = {
      projectId: form.projectId,
      title: form.title.trim(),
      slug: toSlug(form.slug.trim() || form.title),
      category: form.category.trim() || 'Getting Started',
      content: form.content,
      order: Number(form.order) || 0,
      published: form.published,
      updatedAt: now,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateRecord('documentation', editingId, payload);
        if (payload.published) {
          await logProjectActivity(
            payload.projectId,
            'Documentation updated',
            `Updated documentation: ${payload.title}`,
            `Category: ${payload.category}`,
            'system'
          );
        }
        setFeedback({ type: 'success', msg: `Documentation "${payload.title}" updated.` });
      } else {
        await createRecord('documentation', payload);
        if (payload.published) {
          await logProjectActivity(
            payload.projectId,
            'Documentation updated',
            `Added documentation: ${payload.title}`,
            `Category: ${payload.category}`,
            'system'
          );
        }
        setFeedback({ type: 'success', msg: `Documentation "${payload.title}" created.` });
      }
      await refresh();
      setShowForm(false);
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const docsList =
    filterProjectId === 'all'
      ? dataset.documentation
      : dataset.documentation.filter((d) => d.projectId === filterProjectId);

  const moveDoc = async (index: number, dir: -1 | 1) => {
    const target = docsList[index + dir];
    const current = docsList[index];
    if (!target || !current) return;
    await swapOrder(
      'documentation',
      { id: current.id, order: current.order ?? index },
      { id: target.id, order: target.order ?? index + dir }
    );
    await refresh();
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Documentation"
        description="Write, organize, reorder, and publish Markdown documentation pages per project."
        action={
          <div className="flex items-center gap-2">
            <AdminSelect
              value={filterProjectId}
              onChange={(e) => setFilterProjectId(e.target.value)}
              className="w-44 py-1.5 text-xs"
            >
              <option value="all">All Projects</option>
              {dataset.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </AdminSelect>
            <button
              type="button"
              disabled={dataset.projects.length === 0}
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900 disabled:opacity-40 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Page</span>
            </button>
          </div>
        }
      />

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              {editingId ? 'Edit Documentation Page' : 'New Documentation Page'}
            </h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPreviewMode((p) => !p)}
                className="text-xs font-medium text-blue-600 dark:text-blue-400"
              >
                {previewMode ? 'Edit Markdown' : 'Live Preview'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminField label="Project">
              <AdminSelect
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              >
                {dataset.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
            <AdminField label="Category">
              <AdminSelect
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {DOC_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
            <AdminField label="Order">
              <AdminInput
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </AdminField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminField label="Page Title">
              <AdminInput
                required
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                    slug: editingId ? form.slug : toSlug(e.target.value),
                  })
                }
                placeholder="Installation Guide"
              />
            </AdminField>
            <AdminField label="Slug">
              <AdminInput
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })}
                placeholder="installation-guide"
              />
            </AdminField>
          </div>

          {previewMode ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0B0E] p-5 min-h-[240px]">
              <MarkdownRenderer content={form.content || '*Nothing written yet.*'} />
            </div>
          ) : (
            <AdminField label="Content (Markdown)">
              <AdminTextarea
                rows={12}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="# Getting Started&#10;Write documentation in Markdown..."
                className="font-mono text-xs"
              />
            </AdminField>
          )}

          <AdminToggle
            label="Published"
            checked={form.published}
            onChange={(v) => setForm({ ...form, published: v })}
          />

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-medium text-white dark:text-slate-900"
            >
              {saving ? 'Saving...' : 'Save Page'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] divide-y divide-slate-100 dark:divide-slate-800">
        {docsList.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No documentation pages yet.</p>
        ) : (
          docsList.map((doc, idx) => {
            const proj = dataset.projects.find((p) => p.id === doc.projectId);
            return (
              <div
                key={doc.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {proj?.name || 'Project'}
                    </span>
                    <span>·</span>
                    <span>{doc.category}</span>
                    {!doc.published && <span className="text-amber-500">· Draft</span>}
                  </div>
                  <p className="mt-1 font-display text-sm font-semibold text-slate-900 dark:text-white">
                    {doc.title}
                  </p>
                  <p className="text-xs text-slate-500">Updated {formatDate(doc.updatedAt)}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveDoc(idx, -1)}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5 text-slate-600 dark:text-slate-300 disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === docsList.length - 1}
                    onClick={() => moveDoc(idx, 1)}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5 text-slate-600 dark:text-slate-300 disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await updateRecord('documentation', doc.id, { published: !doc.published });
                      await refresh();
                    }}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5 text-slate-600 dark:text-slate-300"
                    title={doc.published ? 'Unpublish' : 'Publish'}
                  >
                    {doc.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(doc)}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5 text-slate-600 dark:text-slate-300"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(doc)}
                    className="rounded-lg border border-red-200 dark:border-red-900/50 p-1.5 text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Documentation Page"
        description={`Delete "${deleteTarget?.title}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteRecord('documentation', deleteTarget.id);
          await refresh();
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export function AdminProjectActivitySection() {
  const { dataset, refresh } = useSiteData();
  const [projectId, setProjectId] = useState(dataset.projects[0]?.id || '');
  const [type, setType] = useState('New feature announced');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPid = projectId || dataset.projects[0]?.id;
    if (!targetPid || !title.trim()) {
      setFeedback({ type: 'error', msg: 'Project and activity title are required.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await logProjectActivity(targetPid, type.trim(), title.trim(), description.trim(), 'manual');
      await refresh();
      setTitle('');
      setDescription('');
      setFeedback({ type: 'success', msg: 'Project activity logged.' });
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Project Activity"
        description="View automatic activity events or manually log announcements and repository milestones."
      />

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      {dataset.projects.length > 0 && (
        <form
          onSubmit={handleAdd}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminField label="Project">
              <AdminSelect
                value={projectId || dataset.projects[0]?.id || ''}
                onChange={(e) => setProjectId(e.target.value)}
              >
                {dataset.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
            <AdminField label="Activity Type">
              <AdminSelect value={type} onChange={(e) => setType(e.target.value)}>
                <option value="New feature announced">New feature announced</option>
                <option value="Project updated">Project updated</option>
                <option value="Release published">Release published</option>
                <option value="Documentation updated">Documentation updated</option>
                <option value="Project archived">Project archived</option>
              </AdminSelect>
            </AdminField>
          </div>
          <AdminField label="Activity Title">
            <AdminInput
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Announced v2 architecture preview"
            />
          </AdminField>
          <AdminField label="Details (Optional)">
            <AdminInput
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </AdminField>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-medium text-white dark:text-slate-900"
          >
            {saving ? 'Logging...' : 'Log Activity'}
          </button>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] divide-y divide-slate-100 dark:divide-slate-800">
        {dataset.projectActivity.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No project activity logged yet.</p>
        ) : (
          dataset.projectActivity.map((act) => {
            const proj = dataset.projects.find((p) => p.id === act.projectId);
            return (
              <div key={act.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">
                    {proj?.name || 'Project'} · {act.type} · {act.source}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                    {act.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteRecord('projectActivity', act.id);
                    await refresh();
                  }}
                  className="rounded-lg border border-red-200 dark:border-red-900/50 p-1.5 text-red-600 dark:text-red-400 shrink-0"
                  title="Delete activity entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
