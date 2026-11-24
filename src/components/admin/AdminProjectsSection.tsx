import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Eye,
  EyeOff,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteData } from '../../context/DataContext';
import {
  createRecord,
  deleteRecord,
  logProjectActivity,
  updateRecord,
} from '../../services/dbService';
import type { Project, ProjectStatus } from '../../types/models';
import {
  formatDate,
  isValidImageUrl,
  normalizeImageUrl,
  nowIso,
  toSlug,
} from '../../utils/formatters';
import { processImageFiles } from '../../utils/imageUpload';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { MediaFrame } from '../ui/MediaFrame';
import {
  AdminField,
  AdminInput,
  AdminSectionHeader,
  AdminSelect,
  AdminTextarea,
  AdminToggle,
  FeedbackBanner,
} from './AdminShared';

type ProjectFormState = {
  name: string;
  slug: string;
  logoUrl: string;
  bannerUrl: string;
  shortDescription: string;
  detailedDescription: string;
  category: string;
  tagsText: string;
  status: ProjectStatus;
  featured: boolean;
  published: boolean;
  latestVersion: string;
  featuresText: string;
  screenshots: string[];
  github: string;
  website: string;
  demo: string;
  docs: string;
};

const EMPTY_FORM: ProjectFormState = {
  name: '',
  slug: '',
  logoUrl: '',
  bannerUrl: '',
  shortDescription: '',
  detailedDescription: '',
  category: 'Software',
  tagsText: '',
  status: 'active',
  featured: false,
  published: true,
  latestVersion: '',
  featuresText: '',
  screenshots: [],
  github: '',
  website: '',
  demo: '',
  docs: '',
};

export function AdminProjectsSection() {
  const { dataset, refresh } = useSiteData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProjectFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [screenshotUrlInput, setScreenshotUrlInput] = useState('');
  const [screenshotHint, setScreenshotHint] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const screenshotsFileRef = useRef<HTMLInputElement | null>(null);
  const logoFileRef = useRef<HTMLInputElement | null>(null);
  const bannerFileRef = useRef<HTMLInputElement | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setScreenshotUrlInput('');
    setScreenshotHint(null);
    setShowForm(true);
    setFeedback(null);
  };

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      logoUrl: p.logoUrl || '',
      bannerUrl: p.bannerUrl || '',
      shortDescription: p.shortDescription || '',
      detailedDescription: p.detailedDescription || '',
      category: p.category || 'Software',
      tagsText: (p.tags || []).join(', '),
      status: p.status || 'active',
      featured: Boolean(p.featured),
      published: Boolean(p.published),
      latestVersion: p.latestVersion || '',
      featuresText: (p.features || []).join('\n'),
      screenshots: Array.isArray(p.screenshots) ? [...p.screenshots] : [],
      github: p.externalLinks?.github || '',
      website: p.externalLinks?.website || '',
      demo: p.externalLinks?.demo || '',
      docs: p.externalLinks?.docs || '',
    });
    setScreenshotUrlInput('');
    setScreenshotHint(null);
    setShowForm(true);
    setFeedback(null);
  };

  const handleAddScreenshotUrls = () => {
    setScreenshotHint(null);
    const candidates = screenshotUrlInput
      .split(/[\n,\s]+/)
      .map((s) => normalizeImageUrl(s))
      .filter(Boolean);

    if (candidates.length === 0) {
      setScreenshotHint('Paste one or more valid image URLs (https://...).');
      return;
    }

    const validUrls: string[] = [];
    const invalidUrls: string[] = [];
    for (const url of candidates) {
      if (isValidImageUrl(url)) {
        validUrls.push(url);
      } else {
        invalidUrls.push(url);
      }
    }

    if (validUrls.length > 0) {
      setForm((prev) => ({
        ...prev,
        screenshots: [...prev.screenshots, ...validUrls],
      }));
      setScreenshotUrlInput('');
    }

    if (invalidUrls.length > 0) {
      setScreenshotHint(
        `${invalidUrls.length} invalid URL(s) skipped. URLs must start with https:// or http://.`
      );
    }
  };

  const handleUploadScreenshots = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    setScreenshotHint(null);

    try {
      const { urls, errors } = await processImageFiles(files, {
        maxDimension: 1400,
        quality: 0.82,
      });

      if (urls.length > 0) {
        setForm((prev) => ({
          ...prev,
          screenshots: [...prev.screenshots, ...urls],
        }));
      }

      if (errors.length > 0) {
        setScreenshotHint(errors[0]);
      } else if (urls.length > 0) {
        setScreenshotHint(
          `Added ${urls.length} ${urls.length === 1 ? 'screenshot' : 'screenshots'}. Click "${editingId ? 'Update Project' : 'Create Project'}" to save.`
        );
      }
    } finally {
      setUploadingImages(false);
      if (screenshotsFileRef.current) {
        screenshotsFileRef.current.value = '';
      }
    }
  };

  const handleUploadSingleAsset = async (
    files: FileList | null,
    field: 'logoUrl' | 'bannerUrl',
    maxDimension: number
  ) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const { urls, errors } = await processImageFiles(files, {
        maxDimension,
        quality: 0.84,
      });
      if (urls[0]) {
        setForm((prev) => ({ ...prev, [field]: urls[0] }));
      } else if (errors[0]) {
        setFeedback({ type: 'error', msg: errors[0] });
      }
    } finally {
      setUploadingImages(false);
      if (field === 'logoUrl' && logoFileRef.current) logoFileRef.current.value = '';
      if (field === 'bannerUrl' && bannerFileRef.current) bannerFileRef.current.value = '';
    }
  };

  const moveScreenshot = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= form.screenshots.length) return;
    setForm((prev) => {
      const next = [...prev.screenshots];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return { ...prev, screenshots: next };
    });
  };

  const removeScreenshot = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const cleanName = form.name.trim();
    const cleanSlug = toSlug(form.slug.trim() || cleanName);
    if (!cleanName || !cleanSlug) {
      setFeedback({ type: 'error', msg: 'Project name and valid URL slug are required.' });
      return;
    }

    const duplicateSlug = dataset.projects.find(
      (p) => p.slug === cleanSlug && p.id !== editingId
    );
    if (duplicateSlug) {
      setFeedback({ type: 'error', msg: `Slug "${cleanSlug}" is already used by another project.` });
      return;
    }

    // Also include any pending URLs still sitting in the screenshotUrlInput box
    let finalScreenshots = [...form.screenshots];
    if (screenshotUrlInput.trim()) {
      const pending = screenshotUrlInput
        .split(/[\n,\s]+/)
        .map((s) => normalizeImageUrl(s))
        .filter((s) => isValidImageUrl(s));
      if (pending.length > 0) {
        finalScreenshots = [...finalScreenshots, ...pending];
      }
    }

    const now = nowIso();
    const payload: Omit<Project, 'id'> = {
      name: cleanName,
      slug: cleanSlug,
      logoUrl: normalizeImageUrl(form.logoUrl),
      bannerUrl: normalizeImageUrl(form.bannerUrl),
      shortDescription: form.shortDescription.trim(),
      detailedDescription: form.detailedDescription,
      category: form.category.trim() || 'Software',
      tags: form.tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status: form.status,
      featured: form.featured,
      published: form.published,
      latestVersion: form.latestVersion.trim(),
      features: form.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
      screenshots: finalScreenshots.map((s) => normalizeImageUrl(s)).filter(Boolean),
      externalLinks: {
        github: form.github.trim(),
        website: form.website.trim(),
        demo: form.demo.trim(),
        docs: form.docs.trim(),
      },
      createdAt: editingId
        ? dataset.projects.find((p) => p.id === editingId)?.createdAt || now
        : now,
      updatedAt: now,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateRecord('projects', editingId, payload);
        await logProjectActivity(
          editingId,
          payload.status === 'archived' ? 'Project archived' : 'Project updated',
          `Updated ${cleanName}`,
          payload.shortDescription || 'Repository metadata updated.',
          'system'
        );
        setFeedback({ type: 'success', msg: `Project "${cleanName}" updated.` });
      } else {
        const newId = await createRecord('projects', payload);
        await logProjectActivity(
          newId,
          'Project created',
          `Initialized ${cleanName}`,
          payload.shortDescription || 'Repository created.',
          'system'
        );
        setFeedback({ type: 'success', msg: `Project "${cleanName}" created.` });
      }
      await refresh();
      setShowForm(false);
      setEditingId(null);
      setScreenshotUrlInput('');
      setScreenshotHint(null);
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to save project',
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (p: Project) => {
    try {
      await updateRecord('projects', p.id, { published: !p.published, updatedAt: nowIso() });
      await refresh();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to update status',
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRecord('projects', deleteTarget.id);
      await refresh();
      setFeedback({ type: 'success', msg: `Deleted "${deleteTarget.name}".` });
      setDeleteTarget(null);
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Delete failed',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Projects"
        description="Manage software repositories, slugs, logos, banners, multiple screenshots, features, and publication status."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        }
      />

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              {editingId ? 'Edit Project' : 'Create Project'}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminField label="Project Name">
              <AdminInput
                required
                value={form.name}
                onChange={(e) => {
                  const nextName = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name: nextName,
                    slug: editingId ? prev.slug : toSlug(nextName),
                  }));
                }}
                placeholder="e.g. Krypton"
              />
            </AdminField>

            <AdminField label="Repository Slug" hint="Used in /projects/<slug>">
              <AdminInput
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })}
                placeholder="krypton"
              />
            </AdminField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminField label="Category">
              <AdminInput
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Android / Utility / Web"
              />
            </AdminField>
            <AdminField label="Status">
              <AdminSelect
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
              >
                <option value="featured">Featured</option>
                <option value="active">Active</option>
                <option value="experimental">Experimental</option>
                <option value="archived">Archived</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="Latest Version">
              <AdminInput
                value={form.latestVersion}
                onChange={(e) => setForm({ ...form, latestVersion: e.target.value })}
                placeholder="v1.0.0"
              />
            </AdminField>
          </div>

          <AdminField label="Short Description">
            <AdminInput
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              placeholder="Concise one-line repository summary"
            />
          </AdminField>

          <AdminField label="Detailed Description (Markdown)">
            <AdminTextarea
              rows={6}
              value={form.detailedDescription}
              onChange={(e) => setForm({ ...form, detailedDescription: e.target.value })}
              placeholder="# Overview&#10;Write detailed README-style documentation..."
            />
          </AdminField>

          {/* Logo & Banner with Upload + URL + Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-[#0D0F14]">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Project Logo
                </label>
                <input
                  ref={logoFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void handleUploadSingleAsset(e.target.files, 'logoUrl', 400)}
                />
                <button
                  type="button"
                  onClick={() => logoFileRef.current?.click()}
                  disabled={uploadingImages}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111318] px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Logo</span>
                </button>
              </div>
              <AdminInput
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                placeholder="Paste https:// image URL or upload file..."
              />
              {form.logoUrl && (
                <div className="flex items-center gap-3 pt-1">
                  <MediaFrame
                    src={form.logoUrl}
                    alt="Logo preview"
                    fit="contain"
                    aspectClassName="h-12 w-12"
                    className="shrink-0"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, logoUrl: '' })}
                    className="text-[11px] text-red-600 dark:text-red-400 hover:underline"
                  >
                    Remove logo
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-[#0D0F14]">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Project Banner
                </label>
                <input
                  ref={bannerFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void handleUploadSingleAsset(e.target.files, 'bannerUrl', 1600)}
                />
                <button
                  type="button"
                  onClick={() => bannerFileRef.current?.click()}
                  disabled={uploadingImages}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111318] px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Banner</span>
                </button>
              </div>
              <AdminInput
                value={form.bannerUrl}
                onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                placeholder="Paste https:// image URL or upload file..."
              />
              {form.bannerUrl && (
                <div className="space-y-1.5 pt-1">
                  <MediaFrame
                    src={form.bannerUrl}
                    alt="Banner preview"
                    fit="cover"
                    aspectClassName="aspect-[21/7]"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, bannerUrl: '' })}
                    className="text-[11px] text-red-600 dark:text-red-400 hover:underline"
                  >
                    Remove banner
                  </button>
                </div>
              )}
            </div>
          </div>

          <AdminField label="Features (One per line)">
            <AdminTextarea
              rows={4}
              value={form.featuresText}
              onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
              placeholder="Fast local processing&#10;Modular plugin system"
            />
          </AdminField>

          {/* Multi-Screenshot Uploader & URL Manager */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0D0F14] p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                  Project Screenshots ({form.screenshots.length})
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Select multiple image files at once or add multiple image URLs. All screenshots are preserved in order.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={screenshotsFileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => void handleUploadScreenshots(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => screenshotsFileRef.current?.click()}
                  disabled={uploadingImages}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-3.5 py-2 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  <span>{uploadingImages ? 'Processing...' : 'Upload Screenshots (Multi)'}</span>
                </button>
              </div>
            </div>

            {/* Add by URL (supports single URL or pasting multiple lines/commas) */}
            <div className="flex flex-col sm:flex-row gap-2">
              <AdminTextarea
                rows={2}
                value={screenshotUrlInput}
                onChange={(e) => setScreenshotUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddScreenshotUrls();
                  }
                }}
                placeholder="Paste one or multiple screenshot URLs (separated by new line or comma)..."
                className="flex-1 min-h-[42px]"
              />
              <button
                type="button"
                onClick={handleAddScreenshotUrls}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111318] px-4 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add URL(s)</span>
              </button>
            </div>

            {screenshotHint && (
              <p className="text-xs text-blue-600 dark:text-blue-400">{screenshotHint}</p>
            )}

            {/* Live Previews Grid */}
            {form.screenshots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {form.screenshots.map((url, idx) => (
                  <div
                    key={`${idx}-${url.slice(0, 32)}`}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-2.5 space-y-2"
                  >
                    <MediaFrame
                      src={url}
                      alt={`Screenshot ${idx + 1}`}
                      fallbackLabel={`Screenshot ${idx + 1}`}
                      fit="contain"
                      aspectClassName="aspect-[16/10]"
                      className="bg-slate-100 dark:bg-[#090B0F]"
                    />

                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 truncate">
                        #{String(idx + 1).padStart(2, '0')} ·{' '}
                        {url.startsWith('data:image/') ? 'Uploaded file' : 'URL'}
                      </span>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveScreenshot(idx, -1)}
                          disabled={idx === 0}
                          title="Move earlier"
                          className="rounded border border-slate-200 dark:border-slate-700 p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveScreenshot(idx, 1)}
                          disabled={idx === form.screenshots.length - 1}
                          title="Move later"
                          className="rounded border border-slate-200 dark:border-slate-700 p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeScreenshot(idx)}
                          title="Remove screenshot"
                          className="rounded border border-red-200 dark:border-red-900/50 p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No screenshots added yet. You can select multiple image files or paste multiple image URLs above.
              </p>
            )}
          </div>

          <AdminField label="Tags (Comma separated)">
            <AdminInput
              value={form.tagsText}
              onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
              placeholder="typescript, android, cli"
            />
          </AdminField>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminField label="GitHub / Source URL">
              <AdminInput
                value={form.github}
                onChange={(e) => setForm({ ...form, github: e.target.value })}
                placeholder="https://github.com/..."
              />
            </AdminField>
            <AdminField label="Website URL">
              <AdminInput
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://..."
              />
            </AdminField>
            <AdminField label="Demo URL">
              <AdminInput
                value={form.demo}
                onChange={(e) => setForm({ ...form, demo: e.target.value })}
                placeholder="https://..."
              />
            </AdminField>
            <AdminField label="External Docs URL">
              <AdminInput
                value={form.docs}
                onChange={(e) => setForm({ ...form, docs: e.target.value })}
                placeholder="https://..."
              />
            </AdminField>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <AdminToggle
              label="Featured on Homepage"
              checked={form.featured}
              onChange={(v) => setForm({ ...form, featured: v })}
            />
            <AdminToggle
              label="Published (Visible to Public)"
              checked={form.published}
              onChange={(v) => setForm({ ...form, published: v })}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || uploadingImages}
              className="rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update Project' : 'Create Project'}
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

      {/* Projects Table / List */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] divide-y divide-slate-100 dark:divide-slate-800">
        {dataset.projects.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
            No projects yet. Click &quot;New Project&quot; to create your first repository.
          </p>
        ) : (
          dataset.projects.map((p) => (
            <div
              key={p.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-base font-semibold text-slate-900 dark:text-white">
                    {p.name}
                  </span>
                  <span className="font-mono text-xs text-slate-500">/projects/{p.slug}</span>
                  <span className="text-xs text-slate-500 capitalize">· {p.status}</span>
                  {p.screenshots.length > 0 && (
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      · {p.screenshots.length} {p.screenshots.length === 1 ? 'screenshot' : 'screenshots'}
                    </span>
                  )}
                  {!p.published && (
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      · Draft
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 truncate">
                  {p.shortDescription || 'No short description'} · Updated {formatDate(p.updatedAt)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {p.published && (
                  <Link
                    to={`/projects/${p.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Preview repository"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => togglePublished(p)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={p.published ? 'Unpublish' : 'Publish'}
                >
                  {p.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{p.published ? 'Unpublish' : 'Publish'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(p)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900/50 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
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
        title="Delete Project"
        description={`Are you sure you want to permanently delete "${deleteTarget?.name}"?`}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
