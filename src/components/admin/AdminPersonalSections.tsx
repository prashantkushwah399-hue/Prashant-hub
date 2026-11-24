import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useSiteData } from '../../context/DataContext';
import { createRecord, deleteRecord, swapOrder, updateRecord } from '../../services/dbService';
import type {
  Achievement,
  CurrentlyWorkingItem,
  Goal,
  GoalCategory,
  JourneyMilestone,
  UpdateCategory,
  UpdatePost,
} from '../../types/models';
import { formatDate, nowIso, todayIsoDate } from '../../utils/formatters';
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

export function AdminJourneySection() {
  const { dataset, refresh } = useSiteData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JourneyMilestone | null>(null);

  const [form, setForm] = useState({
    title: '',
    date: todayIsoDate(),
    description: '',
    category: 'Development',
    imageUrl: '',
    projectId: '',
    order: 0,
    published: true,
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: '',
      date: todayIsoDate(),
      description: '',
      category: 'Development',
      imageUrl: '',
      projectId: '',
      order: dataset.journey.length,
      published: true,
    });
    setShowForm(true);
    setFeedback(null);
  };

  const openEdit = (m: JourneyMilestone) => {
    setEditingId(m.id);
    setForm({
      title: m.title,
      date: m.date,
      description: m.description || '',
      category: m.category || '',
      imageUrl: m.imageUrl || '',
      projectId: m.projectId || '',
      order: m.order ?? 0,
      published: m.published,
    });
    setShowForm(true);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload: Omit<JourneyMilestone, 'id'> = {
        title: form.title.trim(),
        date: form.date,
        description: form.description.trim(),
        category: form.category.trim(),
        imageUrl: form.imageUrl.trim(),
        projectId: form.projectId,
        order: Number(form.order) || 0,
        published: form.published,
      };
      if (editingId) {
        await updateRecord('journey', editingId, payload);
        setFeedback({ type: 'success', msg: 'Milestone updated.' });
      } else {
        await createRecord('journey', payload);
        setFeedback({ type: 'success', msg: 'Milestone added.' });
      }
      await refresh();
      setShowForm(false);
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const a = dataset.journey[idx];
    const b = dataset.journey[idx + dir];
    if (!a || !b) return;
    await swapOrder('journey', { id: a.id, order: a.order ?? idx }, { id: b.id, order: b.order ?? idx + dir });
    await refresh();
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Journey Milestones"
        description="Manage timeline milestones, categories, ordering, and publication."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Milestone</span>
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
              {editingId ? 'Edit Milestone' : 'New Milestone'}
            </h3>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminField label="Title">
              <AdminInput
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </AdminField>
            <AdminField label="Date">
              <AdminInput
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </AdminField>
            <AdminField label="Category">
              <AdminInput
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Learning / Release / Education"
              />
            </AdminField>
          </div>
          <AdminField label="Description">
            <AdminTextarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </AdminField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminField label="Optional Image URL (https://)">
              <AdminInput
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </AdminField>
            <AdminField label="Associated Project (Optional)">
              <AdminSelect
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              >
                <option value="">None</option>
                {dataset.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
          </div>
          <AdminToggle
            label="Published"
            checked={form.published}
            onChange={(v) => setForm({ ...form, published: v })}
          />
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-medium text-white dark:text-slate-900"
            >
              {saving ? 'Saving...' : 'Save Milestone'}
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
        {dataset.journey.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No milestones yet.</p>
        ) : (
          dataset.journey.map((m, idx) => (
            <div
              key={m.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="text-xs text-slate-500">
                  <span className="font-mono">{formatDate(m.date)}</span>
                  {m.category && <span> · {m.category}</span>}
                  {!m.published && <span className="text-amber-500"> · Draft</span>}
                </div>
                <p className="mt-1 font-display text-sm font-semibold text-slate-900 dark:text-white">
                  {m.title}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => move(idx, -1)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5 disabled:opacity-30"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === dataset.journey.length - 1}
                  onClick={() => move(idx, 1)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5 disabled:opacity-30"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await updateRecord('journey', m.id, { published: !m.published });
                    await refresh();
                  }}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5"
                >
                  {m.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(m)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(m)}
                  className="rounded-lg border border-red-200 dark:border-red-900/50 p-1.5 text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Milestone"
        description={`Delete milestone "${deleteTarget?.title}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteRecord('journey', deleteTarget.id);
          await refresh();
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export function AdminGoalsSection() {
  const { dataset, refresh } = useSiteData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Active' as GoalCategory,
    status: 'In Progress',
    targetDate: '',
    useManualProgress: false,
    progress: 0,
    projectId: '',
    order: 0,
    published: true,
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      category: 'Active',
      status: 'In Progress',
      targetDate: '',
      useManualProgress: false,
      progress: 0,
      projectId: '',
      order: dataset.goals.length,
      published: true,
    });
    setShowForm(true);
    setFeedback(null);
  };

  const openEdit = (g: Goal) => {
    setEditingId(g.id);
    setForm({
      title: g.title,
      description: g.description || '',
      category: g.category,
      status: g.status || '',
      targetDate: g.targetDate || '',
      useManualProgress: typeof g.progress === 'number',
      progress: typeof g.progress === 'number' ? g.progress : 0,
      projectId: g.projectId || '',
      order: g.order ?? 0,
      published: g.published,
    });
    setShowForm(true);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload: Omit<Goal, 'id'> = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        status: form.status.trim(),
        targetDate: form.targetDate,
        progress: form.useManualProgress ? Math.min(100, Math.max(0, Number(form.progress))) : null,
        projectId: form.projectId,
        order: Number(form.order) || 0,
        published: form.published,
      };
      if (editingId) {
        await updateRecord('goals', editingId, payload);
        setFeedback({ type: 'success', msg: 'Goal updated.' });
      } else {
        await createRecord('goals', payload);
        setFeedback({ type: 'success', msg: 'Goal created.' });
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
        title="Goals"
        description="Manage Active, Upcoming, and Completed goals with optional manually controlled progress."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Goal</span>
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
              {editingId ? 'Edit Goal' : 'New Goal'}
            </h3>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminField label="Title">
              <AdminInput
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </AdminField>
            <AdminField label="Category">
              <AdminSelect
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as GoalCategory })}
              >
                <option value="Active">Active</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="Status Label">
              <AdminInput
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                placeholder="In Progress / Planned / Done"
              />
            </AdminField>
          </div>
          <AdminField label="Description">
            <AdminTextarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </AdminField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminField label="Target Date (Optional)">
              <AdminInput
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              />
            </AdminField>
            <AdminField label="Associated Project (Optional)">
              <AdminSelect
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              >
                <option value="">None</option>
                {dataset.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
          </div>

          <div className="space-y-3 pt-1">
            <AdminToggle
              label="Include manual progress percentage"
              checked={form.useManualProgress}
              onChange={(v) => setForm({ ...form, useManualProgress: v })}
            />
            {form.useManualProgress && (
              <div className="max-w-xs">
                <AdminField label={`Manual Progress (${form.progress}%)`}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form.progress}
                    onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                    className="w-full"
                  />
                </AdminField>
              </div>
            )}
          </div>

          <AdminToggle
            label="Published"
            checked={form.published}
            onChange={(v) => setForm({ ...form, published: v })}
          />
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-medium text-white dark:text-slate-900"
            >
              {saving ? 'Saving...' : 'Save Goal'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] divide-y divide-slate-100 dark:divide-slate-800">
        {dataset.goals.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No goals yet.</p>
        ) : (
          dataset.goals.map((g) => (
            <div key={g.id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500">
                  <span>{g.category}</span>
                  {g.status && <span> · {g.status}</span>}
                  {typeof g.progress === 'number' && <span> · {g.progress}%</span>}
                  {!g.published && <span className="text-amber-500"> · Draft</span>}
                </div>
                <p className="mt-1 font-display text-sm font-semibold text-slate-900 dark:text-white">
                  {g.title}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(g)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(g)}
                  className="rounded-lg border border-red-200 dark:border-red-900/50 p-1.5 text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Goal"
        description={`Delete goal "${deleteTarget?.title}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteRecord('goals', deleteTarget.id);
          await refresh();
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export function AdminUpdatesSection() {
  const { dataset, refresh } = useSiteData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UpdatePost | null>(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    date: todayIsoDate(),
    category: 'Development' as UpdateCategory,
    imageUrl: '',
    projectId: '',
    published: true,
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: '',
      content: '',
      date: todayIsoDate(),
      category: 'Development',
      imageUrl: '',
      projectId: '',
      published: true,
    });
    setPreview(false);
    setShowForm(true);
    setFeedback(null);
  };

  const openEdit = (u: UpdatePost) => {
    setEditingId(u.id);
    setForm({
      title: u.title,
      content: u.content,
      date: u.date || todayIsoDate(),
      category: (u.category as UpdateCategory) || 'Development',
      imageUrl: u.imageUrl || '',
      projectId: u.projectId || '',
      published: u.published,
    });
    setPreview(false);
    setShowForm(true);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    const now = nowIso();
    setSaving(true);
    try {
      const payload: Omit<UpdatePost, 'id'> = {
        title: form.title.trim(),
        content: form.content,
        date: form.date,
        category: form.category,
        imageUrl: form.imageUrl.trim(),
        projectId: form.projectId,
        published: form.published,
        createdAt: editingId
          ? dataset.updates.find((u) => u.id === editingId)?.createdAt || now
          : now,
        updatedAt: now,
      };
      if (editingId) {
        await updateRecord('updates', editingId, payload);
        setFeedback({ type: 'success', msg: 'Update saved.' });
      } else {
        await createRecord('updates', payload);
        setFeedback({ type: 'success', msg: 'Update created.' });
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
        title="Updates"
        description="Publish personal updates, learning logs, experiments, and project announcements."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Update</span>
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
              {editingId ? 'Edit Update' : 'Create Update'}
            </h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPreview((p) => !p)}
                className="text-xs font-medium text-blue-600 dark:text-blue-400"
              >
                {preview ? 'Edit' : 'Preview'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminField label="Title">
              <AdminInput
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </AdminField>
            <AdminField label="Category">
              <AdminSelect
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as UpdateCategory })}
              >
                <option value="Development">Development</option>
                <option value="Experiments">Experiments</option>
                <option value="Learning">Learning</option>
                <option value="Announcements">Announcements</option>
                <option value="Project Updates">Project Updates</option>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminField label="Optional Image URL (https://)">
              <AdminInput
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </AdminField>
            <AdminField label="Associated Project (Optional)">
              <AdminSelect
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              >
                <option value="">None</option>
                {dataset.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
          </div>

          {preview ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0B0E] p-5">
              <MarkdownRenderer content={form.content} />
            </div>
          ) : (
            <AdminField label="Content (Markdown)">
              <AdminTextarea
                rows={8}
                required
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </AdminField>
          )}

          <AdminToggle
            label="Published (uncheck to save as draft)"
            checked={form.published}
            onChange={(v) => setForm({ ...form, published: v })}
          />
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-medium text-white dark:text-slate-900"
            >
              {saving ? 'Saving...' : form.published ? 'Publish Update' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] divide-y divide-slate-100 dark:divide-slate-800">
        {dataset.updates.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No updates yet.</p>
        ) : (
          dataset.updates.map((u) => (
            <div key={u.id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500">
                  <span>{u.category}</span>
                  <span> · {formatDate(u.date)}</span>
                  {!u.published && <span className="text-amber-500"> · Draft</span>}
                </div>
                <p className="mt-1 font-display text-sm font-semibold text-slate-900 dark:text-white">
                  {u.title}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    await updateRecord('updates', u.id, { published: !u.published });
                    await refresh();
                  }}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5"
                >
                  {u.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(u)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(u)}
                  className="rounded-lg border border-red-200 dark:border-red-900/50 p-1.5 text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Update"
        description={`Delete "${deleteTarget?.title}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteRecord('updates', deleteTarget.id);
          await refresh();
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export function AdminCurrentlyWorkingSection() {
  const { dataset, refresh } = useSiteData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CurrentlyWorkingItem | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    projectId: '',
    status: 'Active',
    lastUpdated: todayIsoDate(),
    order: 0,
    published: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload: Omit<CurrentlyWorkingItem, 'id'> = {
        title: form.title.trim(),
        description: form.description.trim(),
        projectId: form.projectId,
        status: form.status.trim() || 'Active',
        lastUpdated: form.lastUpdated,
        order: Number(form.order) || 0,
        published: form.published,
      };
      if (editingId) {
        await updateRecord('currentlyWorking', editingId, payload);
      } else {
        await createRecord('currentlyWorking', payload);
      }
      await refresh();
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Currently Working On"
        description="Highlight current focus activities on the homepage."
        action={
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({
                title: '',
                description: '',
                projectId: '',
                status: 'Active',
                lastUpdated: todayIsoDate(),
                order: dataset.currentlyWorking.length,
                published: true,
              });
              setShowForm(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Activity</span>
          </button>
        }
      />

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminField label="Activity Title">
              <AdminInput
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </AdminField>
            <AdminField label="Status">
              <AdminInput
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                placeholder="Building / Researching / Testing"
              />
            </AdminField>
            <AdminField label="Last Updated">
              <AdminInput
                type="date"
                value={form.lastUpdated}
                onChange={(e) => setForm({ ...form, lastUpdated: e.target.value })}
              />
            </AdminField>
          </div>
          <AdminField label="Description">
            <AdminTextarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </AdminField>
          <AdminField label="Related Project (Optional)">
            <AdminSelect
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            >
              <option value="">None</option>
              {dataset.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminToggle
            label="Published"
            checked={form.published}
            onChange={(v) => setForm({ ...form, published: v })}
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-medium text-white dark:text-slate-900"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] divide-y divide-slate-100 dark:divide-slate-800">
        {dataset.currentlyWorking.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No active focus items added yet.</p>
        ) : (
          dataset.currentlyWorking.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">
                  {item.status} · Updated {formatDate(item.lastUpdated)}
                  {!item.published && ' · Draft'}
                </p>
                <p className="mt-1 font-display text-sm font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(item.id);
                    setForm({
                      title: item.title,
                      description: item.description,
                      projectId: item.projectId,
                      status: item.status,
                      lastUpdated: item.lastUpdated,
                      order: item.order,
                      published: item.published,
                    });
                    setShowForm(true);
                  }}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="rounded-lg border border-red-200 dark:border-red-900/50 p-1.5 text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Activity"
        description={`Delete "${deleteTarget?.title}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteRecord('currentlyWorking', deleteTarget.id);
          await refresh();
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export function AdminAchievementsSection() {
  const { dataset, refresh } = useSiteData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: todayIsoDate(),
    category: 'Recognition',
    imageUrl: '',
    projectId: '',
    order: 0,
    published: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload: Omit<Achievement, 'id'> = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        category: form.category.trim(),
        imageUrl: form.imageUrl.trim(),
        projectId: form.projectId,
        order: Number(form.order) || 0,
        published: form.published,
      };
      if (editingId) {
        await updateRecord('achievements', editingId, payload);
      } else {
        await createRecord('achievements', payload);
      }
      await refresh();
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Achievements"
        description="Manage verified personal achievements and milestones."
        action={
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({
                title: '',
                description: '',
                date: todayIsoDate(),
                category: 'Recognition',
                imageUrl: '',
                projectId: '',
                order: dataset.achievements.length,
                published: true,
              });
              setShowForm(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Achievement</span>
          </button>
        }
      />

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminField label="Title">
              <AdminInput
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </AdminField>
            <AdminField label="Category">
              <AdminInput
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
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
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </AdminField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminField label="Optional Image URL (https://)">
              <AdminInput
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </AdminField>
            <AdminField label="Related Project (Optional)">
              <AdminSelect
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              >
                <option value="">None</option>
                {dataset.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
          </div>
          <AdminToggle
            label="Published"
            checked={form.published}
            onChange={(v) => setForm({ ...form, published: v })}
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-medium text-white dark:text-slate-900"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] divide-y divide-slate-100 dark:divide-slate-800">
        {dataset.achievements.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No achievements added yet.</p>
        ) : (
          dataset.achievements.map((a) => (
            <div key={a.id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">
                  {a.category} · {formatDate(a.date)}
                  {!a.published && ' · Draft'}
                </p>
                <p className="mt-1 font-display text-sm font-semibold text-slate-900 dark:text-white">
                  {a.title}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(a.id);
                    setForm({
                      title: a.title,
                      description: a.description,
                      date: a.date,
                      category: a.category,
                      imageUrl: a.imageUrl,
                      projectId: a.projectId,
                      order: a.order,
                      published: a.published,
                    });
                    setShowForm(true);
                  }}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(a)}
                  className="rounded-lg border border-red-200 dark:border-red-900/50 p-1.5 text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Achievement"
        description={`Delete "${deleteTarget?.title}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteRecord('achievements', deleteTarget.id);
          await refresh();
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
