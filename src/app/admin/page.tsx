'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, Save, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Settings State
  const [settingsId, setSettingsId] = useState<string>('');
  const [mosqueName, setMosqueName] = useState('Masjid Gino Sugiono');
  const [location, setLocation] = useState('Perumahan Skyland 2');
  const [hijriOffset, setHijriOffset] = useState(0);

  // Stats State
  const [stats, setStats] = useState({
    announcements: 0,
    quotes: 0,
    sliders: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load Settings
        const { data: dbSettings, error: settingsError } = await supabase
          .from('settings')
          .select('*')
          .limit(1)
          .single();

        if (dbSettings && !settingsError) {
          setSettingsId(dbSettings.id);
          setMosqueName(dbSettings.mosque_name);
          setLocation(dbSettings.location);
          setHijriOffset(dbSettings.hijri_date_offset);
        } else if (settingsError && settingsError.code === 'PGRST116') {
          // If no row exists, we create one later
          console.log('No settings row found, will create one on save.');
        }

        // Load Stats
        const [
          { count: countAnn },
          { count: countQuotes },
          { count: countSliders }
        ] = await Promise.all([
          supabase.from('announcements').select('*', { count: 'exact', head: true }),
          supabase.from('quotes').select('*', { count: 'exact', head: true }),
          supabase.from('slider_images').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          announcements: countAnn || 0,
          quotes: countQuotes || 0,
          sliders: countSliders || 0,
        });

      } catch (err) {
        console.error('Error loading admin settings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const payload = {
        mosque_name: mosqueName,
        location: location,
        hijri_date_offset: hijriOffset,
      };

      let resultError = null;

      if (settingsId) {
        // Update
        const { error } = await supabase
          .from('settings')
          .update(payload)
          .eq('id', settingsId);
        resultError = error;
      } else {
        // Insert new settings row
        const { data, error } = await supabase
          .from('settings')
          .insert([payload])
          .select()
          .single();
        
        if (data) setSettingsId(data.id);
        resultError = error;
      }

      if (resultError) throw resultError;

      setStatus({ type: 'success', message: 'Pengaturan masjid berhasil disimpan!' });
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setStatus({ type: 'error', message: err.message || 'Gagal menyimpan pengaturan.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm font-semibold uppercase tracking-widest animate-pulse">
            Memuat Data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-wide uppercase">Dashboard Utama</h2>
        <p className="text-slate-400 text-sm mt-1">
          Selamat datang di panel kontrol Digital Signage TV Masjid.
        </p>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Pengumuman</div>
          <div className="text-4xl font-extrabold text-white mt-4">{stats.announcements}</div>
          <p className="text-slate-500 text-[10px] uppercase font-semibold mt-2">Aktif / Tampil di Ticker</p>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Mutiara Hikmah</div>
          <div className="text-4xl font-extrabold text-white mt-4">{stats.quotes}</div>
          <p className="text-slate-500 text-[10px] uppercase font-semibold mt-2">Kutipan Hadits & Qur'an</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Slider Dokumentasi</div>
          <div className="text-4xl font-extrabold text-white mt-4">{stats.sliders}</div>
          <p className="text-slate-500 text-[10px] uppercase font-semibold mt-2">Gambar Slide TV Utama</p>
        </div>
      </div>

      {/* Settings Form */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3 pb-6 border-b border-white/5 mb-6">
          <Settings className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Pengaturan Identitas Masjid</h3>
        </div>

        {status && (
          <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 text-sm ${
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

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Nama Masjid
              </label>
              <input
                type="text"
                required
                value={mosqueName}
                onChange={(e) => setMosqueName(e.target.value)}
                placeholder="Contoh: Masjid Gino Sugiono"
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Lokasi / Wilayah
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Perumahan Skyland 2"
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Offset Tanggal Hijriah (Hari)
              </label>
              <div className="group relative">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-950 text-slate-200 text-[10px] p-2 rounded-lg w-64 shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 border border-white/10">
                  Gunakan ini jika tanggal Hijriah di TV selisih dengan tanggal ketetapan (misal: isi -1 atau 1).
                </span>
              </div>
            </div>
            
            <input
              type="number"
              required
              value={hijriOffset}
              onChange={(e) => setHijriOffset(parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full md:w-48 bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
            />
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider"
            >
              {saving ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Pengaturan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
