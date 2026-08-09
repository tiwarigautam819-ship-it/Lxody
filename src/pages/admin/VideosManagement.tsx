import React, { useState, useEffect } from 'react';
import { Video, Plus, Edit2, Trash2, CheckCircle, XCircle, Play, ExternalLink, RefreshCw, Eye } from 'lucide-react';
import { TutorialVideo } from '../../types';

export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  return null;
}

export const VideosManagement: React.FC = () => {
  const [videos, setVideos] = useState<TutorialVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingVideo, setEditingVideo] = useState<TutorialVideo | null>(null);

  // Form fields
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [category, setCategory] = useState<string>('New Order Guide');
  const [active, setActive] = useState<boolean>(true);

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/videos', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setVideos(data.videos || []);
      }
    } catch (err) {
      console.error('Error fetching admin videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const openAddModal = () => {
    setEditingVideo(null);
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setCategory('New Order Guide');
    setActive(true);
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const openEditModal = (video: TutorialVideo) => {
    setEditingVideo(video);
    setTitle(video.title);
    setDescription(video.description || '');
    setVideoUrl(video.videoUrl);
    setCategory(video.category || 'New Order Guide');
    setActive(video.active);
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !videoUrl.trim()) {
      setError('Please provide Video Title and Video URL');
      return;
    }

    setSaving(true);
    try {
      const url = editingVideo ? `/api/admin/videos/${editingVideo.id}` : '/api/admin/videos';
      const method = editingVideo ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          videoUrl: videoUrl.trim(),
          category,
          active
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to save video');
      } else {
        setSuccess(editingVideo ? 'Video updated successfully' : 'Video added successfully');
        setShowModal(false);
        await fetchVideos();
      }
    } catch (err: any) {
      setError(err.message || 'Error saving video');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tutorial video?')) return;

    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  const handleToggleActive = async (video: TutorialVideo) => {
    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}`
        },
        body: JSON.stringify({ active: !video.active })
      });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) =>
          prev.map((v) => (v.id === video.id ? { ...v, active: !v.active } : v))
        );
      }
    } catch (err) {
      console.error('Error toggling video active:', err);
    }
  };

  const previewEmbedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Tutorial Videos Management
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Manage YouTube video guides shown under the New Order form for users
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm py-2.5 px-5 rounded-xl flex items-center justify-center space-x-2 shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Video</span>
        </button>
      </div>

      {/* Videos List Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 flex items-center justify-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-red-600" />
          <span className="font-bold text-sm">Loading videos...</span>
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-3 shadow-sm">
          <Video className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-700">No tutorial videos added yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Add YouTube video links to display helpful guide videos under the New Order page.
          </p>
          <button
            onClick={openAddModal}
            className="mt-2 bg-red-600 text-white font-bold text-xs py-2 px-4 rounded-lg hover:bg-red-700"
          >
            Add First Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((vid) => {
            const embed = getYouTubeEmbedUrl(vid.videoUrl);
            return (
              <div
                key={vid.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Embed Video Preview Container */}
                <div className="relative bg-slate-900 aspect-video w-full flex items-center justify-center overflow-hidden">
                  {embed ? (
                    <iframe
                      src={embed}
                      title={vid.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400 space-y-2">
                      <Play className="w-8 h-8 text-red-500 mx-auto" />
                      <p className="text-xs font-mono break-all px-4">{vid.videoUrl}</p>
                    </div>
                  )}

                  <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-slate-700 shadow-sm">
                    {vid.category || 'General Guide'}
                  </span>

                  <span
                    className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center space-x-1 ${
                      vid.active
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    }`}
                  >
                    {vid.active ? 'ACTIVE' : 'HIDDEN'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm leading-snug">
                      {vid.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {vid.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Video Link */}
                  <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 pt-3">
                    <a
                      href={vid.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:underline font-bold flex items-center space-x-1 truncate max-w-[200px]"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{vid.videoUrl}</span>
                    </a>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(vid)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                          vid.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                        title="Toggle visibility"
                      >
                        {vid.active ? 'Active' : 'Show'}
                      </button>

                      <button
                        onClick={() => openEditModal(vid)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit video"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(vid.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                <Video className="w-5 h-5 text-red-600" />
                <span>{editingVideo ? 'Edit Tutorial Video' : 'Add New Tutorial Video'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Video Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., How to Place an Order on SMM Panel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  YouTube Video Link / URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  required
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Paste standard YouTube video link or YouTube embed link.
                </p>
              </div>

              {/* Live Preview If YouTube Link */}
              {previewEmbedUrl && (
                <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video w-full border border-slate-800">
                  <iframe
                    src={previewEmbedUrl}
                    title="Live Preview"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Category Tag
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-800 focus:bg-white focus:outline-none"
                  >
                    <option value="New Order Guide">New Order Guide</option>
                    <option value="Add Funds Guide">Add Funds Guide</option>
                    <option value="Services Guide">Services Guide</option>
                    <option value="General Guide">General Guide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Visibility
                  </label>
                  <button
                    type="button"
                    onClick={() => setActive(!active)}
                    className={`w-full py-2 rounded-xl text-xs font-bold border transition-all ${
                      active
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-red-50 text-red-800 border-red-300'
                    }`}
                  >
                    {active ? 'Visible on New Order' : 'Hidden from Users'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Description / Subtitle
                </label>
                <textarea
                  rows={3}
                  placeholder="Short description explaining what users will learn from this video..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2 px-5 rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingVideo ? 'Update Video' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
