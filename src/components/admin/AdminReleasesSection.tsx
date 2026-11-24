import React, { useState } from 'react';
import { Eye, EyeOff, Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import { useSiteData } from '../../context/DataContext';
import {
  createRecord,
  deleteRecord,
  logProjectActivity,
  updateRecord,
} from '../../services/dbService';
import type {
  DownloadAsset,
  HostingProvider,
  Release,
  ReleaseType,
} from '../../types/models';
import { formatDate, isValidExternalUrl, nowIso, todayIsoDate } from '../../utils/formatters';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import {
  AdminField,
  AdminInput,
  AdminSectionHeader,
  AdminSelect,
  AdminTextarea,
  AdminToggle,
  FeedbackBanner,
} from './AdminShared';

export function AdminReleasesSection() {
  const { dataset, refresh } = useSiteData();
  const [filterProjectId, setFilterProjectId] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Release | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    projectId: dataset.projects[0]?.id || '',
    title: '',
    version: '',
    releaseDate: todayIsoDate(),
    releaseType: 'stable' as ReleaseType,
    versionTag: '',
    description: '',
    notes: '',
    isLatest: true,
    published: true,
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({
      projectId: filterProjectId !== 'all' ? filterProjectId : dataset.projects[0]?.id || '',
      title: '',
      version: '',
      releaseDate: todayIsoDate(),
      releaseType: 'stable',
      versionTag: '',
      description: '',
      notes: '',
      isLatest: true,
      published: true,
    });
    setShowForm(true);
    setFeedback(null);
  };

  const openEdit = (r: Release) => {
    setEditingId(r.id);
    setForm({
      projectId: r.projectId,
      title: r.title,
      version: r.version,
      releaseDate: r.releaseDate || todayIsoDate(),
      releaseType: r.releaseType || 'stable',
      versionTag: r.versionTag || '',
      description: r.description || '',
      notes: r.notes || '',
      isLatest: Boolean(r.isLatest),
      published: Boolean(r.published),
    });
    setShowForm(true);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!form.projectId || !form.title.trim() || !form.version.trim()) {
      setFeedback({ type: 'error', msg: 'Project, release title, and version are required.' });
      return;
    }

    const now = nowIso();
    setSaving(true);
    try {
      // If marked as latest, unmark existing latest releases of this project
      if (form.isLatest) {
        const siblings = dataset.releases.filter(
          (r) => r.projectId === form.projectId && r.isLatest && r.id !== editingId
        );
        await Promise.all(
          siblings.map((s) => updateRecord('releases', s.id, { isLatest: false }))
        );
      }

      const payload: Omit<Release, 'id'> = {
        projectId: form.projectId,
        title: form.title.trim(),
        version: form.version.trim(),
        releaseDate: form.releaseDate,
        releaseType: form.releaseType,
        versionTag: form.versionTag.trim(),
        description: form.description.trim(),
        notes: form.notes,
        isLatest: form.isLatest,
        published: form.published,
        createdAt: editingId
          ? dataset.releases.find((r) => r.id === editingId)?.createdAt || now
          : now,
        updatedAt: now,
      };

      if (editingId) {
        await updateRecord('releases', editingId, payload);
        setFeedback({ type: 'success', msg: `Release "${payload.version}" updated.` });
      } else {
        await createRecord('releases', payload);
        if (payload.published) {
          await logProjectActivity(
            payload.projectId,
            'Release published',
            `Released ${payload.version} — ${payload.title}`,
            payload.description || `New ${payload.releaseType} release published.`,
            'system'
          );
        }
        setFeedback({ type: 'success', msg: `Release "${payload.version}" created.` });
      }

      // Sync project's latestVersion if this release is marked latest and published
      if (form.isLatest && form.published) {
        await updateRecord('projects', form.projectId, {
          latestVersion: form.version.trim(),
          updatedAt: now,
        });
      }

      await refresh();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to save release',
      });
    } finally {
      setSaving(false);
    }
  };

  const markLatest = async (r: Release) => {
    try {
      const siblings = dataset.releases.filter(
        (item) => item.projectId === r.projectId && item.isLatest && item.id !== r.id
      );
      await Promise.all(siblings.map((s) => updateRecord('releases', s.id, { isLatest: false })));
      await updateRecord('releases', r.id, { isLatest: true, updatedAt: nowIso() });
      if (r.published) {
        await updateRecord('projects', r.projectId, {
          latestVersion: r.version,
          updatedAt: nowIso(),
        });
      }
      await refresh();
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Update failed' });
    }
  };

  const togglePublished = async (r: Release) => {
    try {
      const next = !r.published;
      await updateRecord('releases', r.id, { published: next, updatedAt: nowIso() });
      if (next) {
        await logProjectActivity(
          r.projectId,
          'Release published',
          `Published release ${r.version}`,
          r.title,
          'system'
        );
      }
      await refresh();
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Update failed' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRecord('releases', deleteTarget.id);
      await refresh();
      setDeleteTarget(null);
      setFeedback({ type: 'success', msg: `Deleted release "${deleteTarget.version}".` });
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Delete failed' });
    } finally {
      setDeleting(false);
    }
  };

  const visibleReleases =
    filterProjectId === 'all'
      ? dataset.releases
      : dataset.releases.filter((r) => r.projectId === filterProjectId);

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Releases"
        description="Manage versioned releases, release types (Stable, Beta, Experimental), and release notes."
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-40 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Release</span>
            </button>
          </div>
        }
      />

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      {dataset.projects.length === 0 && (
        <p className="text-xs text-slate-500">Create a project first before creating releases.</p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              {editingId ? 'Edit Release' : 'Create Release'}
            </h3>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <AdminField label="Release Title">
              <AdminInput
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Initial Public Release"
              />
            </AdminField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <AdminField label="Version Number">
              <AdminInput
                required
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                placeholder="v1.0.0"
              />
            </AdminField>
            <AdminField label="Release Type">
              <AdminSelect
                value={form.releaseType}
                onChange={(e) => setForm({ ...form, releaseType: e.target.value as ReleaseType })}
              >
                <option value="stable">Stable</option>
                <option value="beta">Beta</option>
                <option value="experimental">Experimental</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="Release Date">
              <AdminInput
                type="date"
                value={form.releaseDate}
                onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
              />
            </AdminField>
            <AdminField label="Version Tag (Optional)">
              <AdminInput
                value={form.versionTag}
                onChange={(e) => setForm({ ...form, versionTag: e.target.value })}
                placeholder="v1.0.0-stable"
              />
            </AdminField>
          </div>

          <AdminField label="Short Description">
            <AdminInput
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Summary of this release"
            />
          </AdminField>

          <AdminField label="Release Notes (Markdown)">
            <AdminTextarea
              rows={5}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Detailed release notes, highlights, upgrade steps..."
            />
          </AdminField>

          <div className="flex flex-wrap items-center gap-6 pt-1">
            <AdminToggle
              label="Mark as Latest Release"
              checked={form.isLatest}
              onChange={(v) => setForm({ ...form, isLatest: v })}
            />
            <AdminToggle
              label="Published"
              checked={form.published}
              onChange={(v) => setForm({ ...form, published: v })}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-medium text-white dark:text-slate-900 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update Release' : 'Create Release'}
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
        {visibleReleases.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">No releases created yet.</p>
        ) : (
          visibleReleases.map((r) => {
            const proj = dataset.projects.find((p) => p.id === r.projectId);
            return (
              <div
                key={r.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {proj?.name || 'Unknown Project'}
                    </span>
                    <span>·</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      {r.version}
                    </span>
                    <span className="capitalize">· {r.releaseType}</span>
                    {r.isLatest && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        · Latest
                      </span>
                    )}
                    {!r.published && (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        · Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-display text-sm font-semibold text-slate-900 dark:text-white">
                    {r.title}
                  </p>
                  <p className="text-xs text-slate-500 tabular-nums">
                    {formatDate(r.releaseDate)} ·{' '}
                    {dataset.assets.filter((a) => a.releaseId === r.id).length} assets
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {!r.isLatest && (
                    <button
                      type="button"
                      onClick={() => markLatest(r)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Set Latest</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => togglePublished(r)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {r.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{r.published ? 'Unpublish' : 'Publish'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(r)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900/50 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400"
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
        title="Delete Release"
        description={`Delete release "${deleteTarget?.version} — ${deleteTarget?.title}"?`}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export function AdminAssetsSection() {
  const { dataset, refresh } = useSiteData();
  const [filterProjectId, setFilterProjectId] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DownloadAsset | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    projectId: dataset.projects[0]?.id || '',
    releaseId: '',
    name: '',
    fileName: '',
    fileType: 'APK',
    fileSize: '',
    version: '',
    provider: 'MediaFire' as HostingProvider,
    downloadUrl: '',
    description: '',
    order: 0,
  });

  const releasesForProject = dataset.releases.filter((r) => r.projectId === form.projectId);

  const openCreate = () => {
    const pid = filterProjectId !== 'all' ? filterProjectId : dataset.projects[0]?.id || '';
    const firstRel = dataset.releases.find((r) => r.projectId === pid);
    setEditingId(null);
    setForm({
      projectId: pid,
      releaseId: firstRel?.id || '',
      name: '',
      fileName: '',
      fileType: 'APK',
      fileSize: '',
      version: firstRel?.version || '',
      provider: 'MediaFire',
      downloadUrl: '',
      description: '',
      order: dataset.assets.length,
    });
    setShowForm(true);
    setFeedback(null);
  };

  const openEdit = (a: DownloadAsset) => {
    const linkedRel = dataset.releases.find((r) => r.id === a.releaseId);
    setEditingId(a.id);
    setForm({
      projectId: a.projectId,
      releaseId: a.releaseId || '',
      name: a.name,
      fileName: a.fileName || '',
      fileType: a.fileType || '',
      fileSize: a.fileSize || '',
      version: a.version || linkedRel?.version || '',
      provider: a.provider || 'Other',
      downloadUrl: a.downloadUrl,
      description: a.description || '',
      order: a.order ?? 0,
    });
    setShowForm(true);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!form.projectId || !form.name.trim()) {
      setFeedback({ type: 'error', msg: 'Project and asset name are required.' });
      return;
    }
    if (!isValidExternalUrl(form.downloadUrl)) {
      setFeedback({
        type: 'error',
        msg: 'Please enter a valid external URL starting with https:// or http://.',
      });
      return;
    }

    const payload: Omit<DownloadAsset, 'id'> = {
      projectId: form.projectId,
      releaseId: form.releaseId || '',
      name: form.name.trim(),
      fileName: form.fileName.trim(),
      fileType: form.fileType.trim() || 'File',
      fileSize: form.fileSize.trim(),
      version: form.version.trim(),
      provider: form.provider,
      downloadUrl: form.downloadUrl.trim(),
      description: form.description.trim(),
      order: Number(form.order) || 0,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateRecord('assets', editingId, payload);
        setFeedback({ type: 'success', msg: `Asset "${payload.name}" updated.` });
      } else {
        await createRecord('assets', payload);
        setFeedback({ type: 'success', msg: `Asset "${payload.name}" added.` });
      }
      await refresh();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRecord('assets', deleteTarget.id);
      await refresh();
      setDeleteTarget(null);
      setFeedback({ type: 'success', msg: `Removed "${deleteTarget.name}".` });
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Delete failed' });
    } finally {
      setDeleting(false);
    }
  };

  const visibleAssets =
    filterProjectId === 'all'
      ? dataset.assets
      : dataset.assets.filter((a) => a.projectId === filterProjectId);

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="External Download Assets"
        description="Add, edit, and remove APK, ZIP, PDF, or other external download links for projects and releases."
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
              <span>Add Asset</span>
            </button>
          </div>
        }
      />

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      {dataset.projects.length === 0 && (
        <p className="text-xs text-slate-500">Create a project first before attaching download assets.</p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              {editingId ? 'Edit Download Asset' : 'Attach Download Asset'}
            </h3>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminField label="Project">
              <AdminSelect
                value={form.projectId}
                onChange={(e) => {
                  const pid = e.target.value;
                  const firstRel = dataset.releases.find((r) => r.projectId === pid);
                  setForm({
                    ...form,
                    projectId: pid,
                    releaseId: firstRel?.id || '',
                    version: firstRel?.version || form.version,
                  });
                }}
              >
                {dataset.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>

            <AdminField label="Release (Optional)" hint="Leave as Project-level for general downloads">
              <AdminSelect
                value={form.releaseId}
                onChange={(e) => {
                  const rid = e.target.value;
                  const rel = releasesForProject.find((r) => r.id === rid);
                  setForm({
                    ...form,
                    releaseId: rid,
                    version: rel ? rel.version : form.version,
                  });
                }}
              >
                <option value="">Project-level (No specific release)</option>
                {releasesForProject.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.version} — {r.title}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminField label="Asset Name">
              <AdminInput
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Krypton Android APK"
              />
            </AdminField>
            <AdminField label="File Type">
              <AdminInput
                list="asset-file-types"
                value={form.fileType}
                onChange={(e) => setForm({ ...form, fileType: e.target.value })}
                placeholder="APK / ZIP / PDF / EXE"
              />
              <datalist id="asset-file-types">
                <option value="APK" />
                <option value="ZIP" />
                <option value="PDF" />
                <option value="TAR.GZ" />
                <option value="EXE" />
                <option value="DMG" />
                <option value="IPA" />
              </datalist>
            </AdminField>
            <AdminField label="Version">
              <AdminInput
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                placeholder="v1.0.0"
              />
            </AdminField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <AdminField label="File Name (Optional)">
              <AdminInput
                value={form.fileName}
                onChange={(e) => setForm({ ...form, fileName: e.target.value })}
                placeholder="Krypton-v12.apk"
              />
            </AdminField>
            <AdminField label="File Size (Optional)">
              <AdminInput
                value={form.fileSize}
                onChange={(e) => setForm({ ...form, fileSize: e.target.value })}
                placeholder="24.5 MB"
              />
            </AdminField>
            <AdminField label="Hosting Provider">
              <AdminSelect
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value as HostingProvider })}
              >
                <option value="MediaFire">MediaFire</option>
                <option value="Google Drive">Google Drive</option>
                <option value="GitHub">GitHub</option>
                <option value="Direct">Direct</option>
                <option value="Other">Other</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="Display Order">
              <AdminInput
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </AdminField>
          </div>

          <AdminField label="External Download URL">
            <AdminInput
              required
              type="url"
              value={form.downloadUrl}
              onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}
              placeholder="https://www.mediafire.com/file/..."
            />
          </AdminField>

          <AdminField label="Description (Optional)">
            <AdminTextarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Architecture notes, checksum, or contents summary"
            />
          </AdminField>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-medium text-white dark:text-slate-900 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update Asset' : 'Save Asset'}
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
        {visibleAssets.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
            No external download assets configured yet.
          </p>
        ) : (
          visibleAssets.map((asset) => {
            const proj = dataset.projects.find((p) => p.id === asset.projectId);
            const rel = dataset.releases.find((r) => r.id === asset.releaseId);
            const displayVersion = asset.version || rel?.version;
            return (
              <div
                key={asset.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {proj?.name || 'Project'}
                    </span>
                    {displayVersion && (
                      <>
                        <span>·</span>
                        <span className="font-mono text-slate-900 dark:text-slate-200">
                          {displayVersion}
                        </span>
                      </>
                    )}
                    {!asset.releaseId && <span>· Project Download</span>}
                    {asset.fileType && <span>· {asset.fileType}</span>}
                    <span>· {asset.provider}</span>
                    {asset.fileSize && <span>· {asset.fileSize}</span>}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {asset.name} {asset.fileName ? `(${asset.fileName})` : ''}
                  </p>
                  {asset.description && (
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                      {asset.description}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs font-mono text-slate-500 truncate">
                    {asset.downloadUrl}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(asset)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit asset"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(asset)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900/50 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Delete asset"
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
        title="Delete Asset"
        description={`Remove download asset "${deleteTarget?.name}"?`}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
