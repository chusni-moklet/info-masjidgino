'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Save, 
  X, 
  CheckCircle, 
  AlertCircle,
  ArrowUpDown,
  UploadCloud
} from 'lucide-react';

interface SliderImage {
  id: string;
  image_url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminSliderPage() {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [imageUrl, setImageUrl] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Upload file to Supabase Storage bucket 'sliders'
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);
    setStatus(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `slider-images/${fileName}`;

      // Upload to storage bucket
      const { data, error: uploadError } = await supabase.storage
        .from('sliders')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Retrieve public URL
      const { data: { publicUrl } } = supabase.storage
        .from('sliders')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      setStatus({ type: 'success', message: 'Gambar berhasil diunggah!' });
    } catch (err: any) {
      console.error('Upload error:', err);
      setStatus({ type: 'error', message: err.message || 'Gagal mengunggah gambar.' });
    } finally {
      setUploading(false);
    }
  };

  const loadImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('slider_images')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (err: any) {
      console.error('Error loading images:', err);
      setStatus({ type: 'error', message: err.message || 'Gagal memuat gambar slider.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleOpenCreate = () => {
    setImageUrl('');
    // Default order index is count + 1
    setOrderIndex(images.length + 1);
    setIsActive(true);
    setShowForm(true);
    setStatus(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const payload = {
        image_url: imageUrl,
        order_index: orderIndex,
        is_active: isActive,
      };

      const { error } = await supabase
        .from('slider_images')
        .insert([payload]);

      if (error) throw error;
      setStatus({ type: 'success', message: 'Gambar slider baru berhasil ditambahkan!' });

      handleCloseForm();
      loadImages();
    } catch (err: any) {
      console.error('Error saving image:', err);
      setStatus({ type: 'error', message: err.message || 'Gagal menambahkan gambar.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (img: SliderImage) => {
    try {
      const updatedStatus = !img.is_active;
      const { error } = await supabase
        .from('slider_images')
        .update({ is_active: updatedStatus })
        .eq('id', img.id);

      if (error) throw error;

      // Update state locally
      setImages(prev => 
        prev.map(item => item.id === img.id ? { ...item, is_active: updatedStatus } : item)
      );
      setStatus({ type: 'success', message: `Status gambar berhasil diubah!` });
    } catch (err: any) {
      console.error('Error toggling status:', err);
      setStatus({ type: 'error', message: err.message || 'Gagal mengubah status.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus gambar ini dari slider?')) return;

    try {
      const { error } = await supabase
        .from('slider_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setStatus({ type: 'success', message: 'Gambar slider berhasil dihapus!' });
      loadImages();
    } catch (err: any) {
      console.error('Error deleting image:', err);
      setStatus({ type: 'error', message: err.message || 'Gagal menghapus gambar.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide uppercase">Galeri Slider Gambar</h2>
          <p className="text-slate-400 text-sm mt-1">
            Kelola foto dokumentasi kegiatan atau poster dakwah yang tampil di layar utama display TV.
          </p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Gambar
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
              Tambah Gambar Slider Baru
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
                Upload Gambar
              </label>
              <div className="relative border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-950/40 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <UploadCloud className={`w-10 h-10 ${uploading ? 'text-emerald-400 animate-bounce' : 'text-slate-400'} mb-2`} />
                <span className="text-xs text-slate-300 font-medium">
                  {uploading ? 'Mengunggah gambar...' : 'Klik atau seret file gambar ke sini'}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold mt-1">
                  Format: PNG, JPG, JPEG (Max. 5MB)
                </span>
              </div>
            </div>

            {imageUrl && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Preview Gambar
                </label>
                <div className="rounded-xl overflow-hidden border border-white/10 relative h-40 w-full max-w-sm bg-slate-950">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <details className="group border-b border-white/5 pb-2">
              <summary className="text-[11px] font-bold text-slate-400 group-open:text-emerald-400 cursor-pointer list-none flex items-center gap-1 uppercase tracking-wider">
                <span className="transition-transform group-open:rotate-90 inline-block">▶</span> Atau Masukkan URL Gambar Manual
              </summary>
              <div className="pt-3">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Masukkan link gambar (https://...)"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                />
              </div>
            </details>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Urutan Tampil (Order Index)
                </label>
                <input
                  type="number"
                  required
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
                  placeholder="1"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                />
              </div>

              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-white/10 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                />
                <label htmlFor="is_active" className="text-xs font-semibold uppercase tracking-wider text-slate-300 ml-2.5 select-none cursor-pointer">
                  Aktifkan gambar ini
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving || uploading || !imageUrl}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider"
              >
                {saving ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Gambar
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

      {/* Main Grid View */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/5 text-slate-400">
          <ImageIcon className="w-8 h-8 mx-auto text-slate-500 mb-3" />
          <p className="text-sm uppercase tracking-wider font-semibold">Belum Ada Gambar Slider</p>
          <p className="text-xs mt-1 text-slate-500">Klik tombol di atas untuk menambahkan gambar dokumentasi pertama.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <div 
              key={img.id} 
              className={`glass-panel rounded-2xl overflow-hidden border transition-all duration-300 ${
                img.is_active ? 'border-white/5' : 'border-white/5 opacity-50'
              }`}
            >
              {/* Thumbnail Image */}
              <div className="h-48 w-full relative bg-slate-950 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={img.image_url} 
                  alt="Thumbnail" 
                  className="w-full h-full object-cover"
                />
                
                {/* Order Index and Active Badge Overlay */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
                  <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                  SLIDE {img.order_index}
                </div>

                {!img.is_active && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Nonaktif
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 flex items-center justify-between border-t border-white/5 bg-slate-900/20">
                <button
                  onClick={() => handleToggleActive(img)}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  {img.is_active ? (
                    <>
                      <ToggleRight className="w-8 h-8 text-emerald-400" />
                      Tampil
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                      Sembunyi
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-2 bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg transition-all border border-white/5 cursor-pointer"
                  title="Hapus Gambar"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
