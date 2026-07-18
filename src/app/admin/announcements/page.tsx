'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Save, 
  X, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

interface Announcement {
  id: string;
  content: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err: any) {
      console.error('Error loading announcements:', err);
      setStatus({ type: 'error', message: err.message || 'Gagal memuat pengumuman.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setContent('');
    setIsActive(true);
    setShowForm(true);
    setStatus(null);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditId(ann.id);
    setContent(ann.content);
    setIsActive(ann.is_active);
    setShowForm(true);
    setStatus(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditId(null);
    setContent('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      if (editId) {
        // Update
        const { error } = await supabase
          .from('announcements')
          .update({ content, is_active: isActive })
          .eq('id', editId);
        
        if (error) throw error;
        setStatus({ type: 'success', message: 'Pengumuman berhasil diperbarui!' });
      } else {
        // Insert
        const { error } = await supabase
          .from('announcements')
          .insert([{ content, is_active: isActive }]);

        if (error) throw error;
        setStatus({ type: 'success', message: 'Pengumuman baru berhasil ditambahkan!' });
      }

      handleCloseForm();
      loadAnnouncements();
    } catch (err: any) {
      console.error('Error saving announcement:', err);
      setStatus({ type: 'error', message: err.message || 'Gagal menyimpan pengumuman.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (ann: Announcement) => {
    try {
      const updatedStatus = !ann.is_active;
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: updatedStatus })
        .eq('id', ann.id);

      if (error) throw error;

      // Update state locally
      setAnnouncements(prev => 
        prev.map(item => item.id === ann.id ? { ...item, is_active: updatedStatus } : item)
      );
      setStatus({ type: 'success', message: `Status pengumuman berhasil diubah!` });
    } catch (err: any) {
      console.error('Error toggling status:', err);
      setStatus({ type: 'error', message: err.message || 'Gagal mengubah status.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setStatus({ type: 'success', message: 'Pengumuman berhasil dihapus!' });
      loadAnnouncements();
    } catch (err: any) {
      console.error('Error deleting announcement:', err);
      setStatus({ type: 'error', message: err.message || 'Gagal menghapus pengumuman.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide uppercase">Daftar Pengumuman</h2>
          <p className="text-slate-400 text-sm mt-1">
            Kelola pengumuman berjalan (running ticker) yang tampil di bagian bawah layar display TV.
          </p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengumuman
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
          status.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
            : 'bg-red-500/10 border-red-500/20 text-red-300'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* Slide-out/Inline Form Panel */}
      {showForm && (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 shadow-xl bg-slate-900/40">
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
              {editId ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}
            </h3>
            <button 
              onClick={handleCloseForm}
              className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Konten Pengumuman
              </label>
              <textarea
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis pengumuman di sini..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-white/10 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
              />
              <label htmlFor="is_active" className="text-xs font-semibold uppercase tracking-wider text-slate-300 select-none cursor-pointer">
                Aktifkan pengumuman ini (langsung tampil di TV)
              </label>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider"
              >
                {saving ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Pengumuman
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCloseForm}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors cursor-pointer text-xs uppercase tracking-wider border border-white/5"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/5 text-slate-400">
          <Megaphone className="w-8 h-8 mx-auto text-slate-500 mb-3" />
          <p className="text-sm uppercase tracking-wider font-semibold">Belum Ada Pengumuman</p>
          <p className="text-xs mt-1 text-slate-500">Klik tombol di atas untuk menambahkan pengumuman pertama.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Pengumuman</th>
                  <th className="py-4 px-6 text-center w-28">Status</th>
                  <th className="py-4 px-6 text-right w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {announcements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-white/2">
                    <td className="py-4 px-6 font-medium text-slate-200 leading-relaxed text-sm">
                      {ann.content}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleActive(ann)}
                        className="inline-flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={ann.is_active ? 'Matikan' : 'Aktifkan'}
                      >
                        {ann.is_active ? (
                          <ToggleRight className="w-9 h-9 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-9 h-9 text-slate-600" />
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(ann)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded-lg transition-all border border-white/5 cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(ann.id)}
                          className="p-2 bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg transition-all border border-white/5 cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
