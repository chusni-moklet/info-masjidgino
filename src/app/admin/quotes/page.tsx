'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, 
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

interface Quote {
  id: string;
  quote_text: string;
  author: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [quoteText, setQuoteText] = useState('');
  const [author, setAuthor] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (err: any) {
      console.error('Error loading quotes:', err);
      setStatus({ type: 'error', message: err.message || 'Gagal memuat kutipan/quotes.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setQuoteText('');
    setAuthor('');
    setIsActive(true);
    setShowForm(true);
    setStatus(null);
  };

  const handleOpenEdit = (q: Quote) => {
    setEditId(q.id);
    setQuoteText(q.quote_text);
    setAuthor(q.author);
    setIsActive(q.is_active);
    setShowForm(true);
    setStatus(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditId(null);
    setQuoteText('');
    setAuthor('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const payload = {
        quote_text: quoteText,
        author: author || 'Anonim',
        is_active: isActive,
      };

      if (editId) {
        // Update
        const { error } = await supabase
          .from('quotes')
          .update(payload)
          .eq('id', editId);
        
        if (error) throw error;
        setStatus({ type: 'success', message: 'Mutiara hikmah berhasil diperbarui!' });
      } else {
        // Insert
        const { error } = await supabase
          .from('quotes')
          .insert([payload]);

        if (error) throw error;
        setStatus({ type: 'success', message: 'Mutiara hikmah baru berhasil ditambahkan!' });
      }

      handleCloseForm();
      loadQuotes();
    } catch (err: any) {
      console.error('Error saving quote:', err);
      setStatus({ type: 'error', message: err.message || 'Gagal menyimpan kutipan.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (q: Quote) => {
    try {
      const updatedStatus = !q.is_active;
      const { error } = await supabase
        .from('quotes')
        .update({ is_active: updatedStatus })
        .eq('id', q.id);

      if (error) throw error;

      // Update state locally
      setQuotes(prev => 
        prev.map(item => item.id === q.id ? { ...item, is_active: updatedStatus } : item)
      );
      setStatus({ type: 'success', message: `Status kutipan berhasil diubah!` });
    } catch (err: any) {
      console.error('Error toggling status:', err);
      setStatus({ type: 'error', message: err.message || 'Gagal mengubah status.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kutipan ini?')) return;

    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setStatus({ type: 'success', message: 'Kutipan berhasil dihapus!' });
      loadQuotes();
    } catch (err: any) {
      console.error('Error deleting quote:', err);
      setStatus({ type: 'error', message: err.message || 'Gagal menghapus kutipan.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide uppercase">Daftar Mutiara Hikmah</h2>
          <p className="text-slate-400 text-sm mt-1">
            Kelola kutipan ayat Al-Qur'an, Hadits, maupun nasihat islami yang tampil bergantian di display TV.
          </p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Mutiara Hikmah
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
              {editId ? 'Edit Mutiara Hikmah' : 'Tambah Mutiara Hikmah Baru'}
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
                Teks Kutipan / Nasihat
              </label>
              <textarea
                required
                rows={3}
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="Tuliskan hadits, ayat, atau petuah bijak di sini..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Sumber / Periwayat / Penulis
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Contoh: HR. Bukhari, QS. Al-Baqarah: 183, atau Abu Bakar Ash-Shiddiq"
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
                Aktifkan kutipan ini (tampil di TV)
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
                    Simpan Kutipan
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
      ) : quotes.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/5 text-slate-400">
          <BookOpen className="w-8 h-8 mx-auto text-slate-500 mb-3" />
          <p className="text-sm uppercase tracking-wider font-semibold">Belum Ada Mutiara Hikmah</p>
          <p className="text-xs mt-1 text-slate-500">Klik tombol di atas untuk menambahkan kutipan pertama.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Teks Kutipan</th>
                  <th className="py-4 px-6 w-48">Sumber</th>
                  <th className="py-4 px-6 text-center w-28">Status</th>
                  <th className="py-4 px-6 text-right w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-white/2">
                    <td className="py-4 px-6 font-medium text-slate-200 leading-relaxed text-sm">
                      "{q.quote_text}"
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                      {q.author}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleActive(q)}
                        className="inline-flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={q.is_active ? 'Matikan' : 'Aktifkan'}
                      >
                        {q.is_active ? (
                          <ToggleRight className="w-9 h-9 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-9 h-9 text-slate-600" />
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(q)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded-lg transition-all border border-white/5 cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(q.id)}
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
