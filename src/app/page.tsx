'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/display/Header';
import Clock from '@/components/display/Clock';
import PrayerTimes from '@/components/display/PrayerTimes';
import MediaSlider from '@/components/display/MediaSlider';
import RealtimeContent from '@/components/display/RealtimeContent';

// Default Fallback Data (Mock data in case Supabase is not configured or offline)
const FALLBACK_SETTINGS = {
  mosque_name: 'Masjid Gino Sugiono',
  location: 'Perumahan Skyland 2',
  hijri_date_offset: 0,
};

const FALLBACK_PRAYER_TIMES = [
  { name: 'Imsak', time: '04:08' },
  { name: 'Subuh', time: '04:18' },
  { name: 'Syuruq', time: '05:35' },
  { name: 'Dzuhur', time: '11:35' },
  { name: 'Ashar', time: '14:55' },
  { name: 'Maghrib', time: '17:28' },
  { name: 'Isya', time: '18:42' },
];

const FALLBACK_SLIDER = [
  { id: '1', image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200', order_index: 1 },
  { id: '2', image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=1200', order_index: 2 },
  { id: '3', image_url: 'https://images.unsplash.com/photo-1597935258735-e254c1839512?auto=format&fit=crop&q=80&w=1200', order_index: 3 },
];

const FALLBACK_ANNOUNCEMENTS = [
  { id: '1', content: 'Selamat Datang di Masjid Gino Sugiono. Mohon menonaktifkan suara handphone selama ibadah berlangsung.', is_active: true },
  { id: '2', content: 'Kajian Rutin Tafsir Al-Quran dilaksanakan setiap hari Ahad ba\'da Subuh bersama Ustadz Haji Sugiono.', is_active: true },
  { id: '3', content: 'Mari salurkan infak terbaik Anda untuk pembangunan fasilitas wudhu dan sanitasi masjid.', is_active: true },
];

const FALLBACK_QUOTES = [
  { id: '1', quote_text: 'Sesungguhnya shalat itu mencegah dari (perbuatan) keji dan mungkar.', author: 'QS. Al-Ankabut: 45', is_active: true },
  { id: '2', quote_text: 'Hiasilah Al-Quran dengan suaramu yang merdu.', author: 'HR. Abu Dawud', is_active: true },
  { id: '3', quote_text: 'Barang siapa yang membangun masjid karena Allah, maka Allah akan membangunkan baginya rumah di surga.', author: 'HR. Bukhari & Muslim', is_active: true },
];

export default function PublicDisplayPage() {
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);
  const [prayerTimes, setPrayerTimes] = useState(FALLBACK_PRAYER_TIMES);
  const [sliderImages, setSliderImages] = useState<any[]>(FALLBACK_SLIDER);
  const [announcements, setAnnouncements] = useState<any[]>(FALLBACK_ANNOUNCEMENTS);
  const [quotes, setQuotes] = useState<any[]>(FALLBACK_QUOTES);
  const [activePrayer, setActivePrayer] = useState<string | null>(null);

  // Load data from Supabase
  useEffect(() => {
    async function fetchDisplayData() {
      try {
        // Test connection by fetching settings
        const { data: dbSettings, error: settingsError } = await supabase
          .from('settings')
          .select('*')
          .limit(1)
          .single();

        if (dbSettings && !settingsError) {
          setSettings(dbSettings);
        }

        // Fetch active slider images
        const { data: dbSlider } = await supabase
          .from('slider_images')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (dbSlider && dbSlider.length > 0) {
          setSliderImages(dbSlider);
        }

        // Fetch announcements
        const { data: dbAnnouncements } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (dbAnnouncements && dbAnnouncements.length > 0) {
          setAnnouncements(dbAnnouncements);
        }

        // Fetch quotes
        const { data: dbQuotes } = await supabase
          .from('quotes')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (dbQuotes && dbQuotes.length > 0) {
          setQuotes(dbQuotes);
        }
      } catch (err) {
        console.warn('Using fallback data. Supabase is not connected or initialized:', err);
      }
    }

    fetchDisplayData();
  }, []);

  // Fetch real prayer times for Malang City from public API
  useEffect(() => {
    async function fetchLivePrayerTimes() {
      try {
        // Kota Malang ID is 1609 in myQuran API
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/kota/1609/${year}/${month}/${day}`);
        const result = await res.json();
        
        if (result.status && result.data && result.data.jadwal) {
          const j = result.data.jadwal;
          const apiPrayerTimes = [
            { name: 'Imsak', time: j.imsak },
            { name: 'Subuh', time: j.subuh },
            { name: 'Syuruq', time: j.terbit },
            { name: 'Dzuhur', time: j.dzuhur },
            { name: 'Ashar', time: j.ashar },
            { name: 'Maghrib', time: j.maghrib },
            { name: 'Isya', time: j.isya },
          ];
          setPrayerTimes(apiPrayerTimes);
        }
      } catch (err) {
        console.warn('Failed to fetch prayer times from myquran API, using default Malang schedules:', err);
      }
    }

    fetchLivePrayerTimes();
  }, []);

  // Active prayer highlight engine
  useEffect(() => {
    const checkActivePrayer = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const jakartaTime = new Date(utc + 3600000 * 7); // UTC+7
      
      const currentMinutes = jakartaTime.getHours() * 60 + jakartaTime.getMinutes();

      // Convert "HH:MM" prayer time to minutes
      const getMinutes = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };

      const sortedPrayers = [...prayerTimes].sort((a, b) => a.time.localeCompare(b.time));
      
      let active = null;

      for (let i = 0; i < sortedPrayers.length; i++) {
        const currentPrayer = sortedPrayers[i];
        const nextPrayer = sortedPrayers[(i + 1) % sortedPrayers.length];
        
        const currentPMin = getMinutes(currentPrayer.time);
        let nextPMin = getMinutes(nextPrayer.time);

        if (nextPMin < currentPMin) {
          // Wrap around midnight (e.g. Isya to Imsak)
          if (currentMinutes >= currentPMin || currentMinutes < nextPMin) {
            active = currentPrayer.name;
            break;
          }
        } else {
          if (currentMinutes >= currentPMin && currentMinutes < nextPMin) {
            active = currentPrayer.name;
            break;
          }
        }
      }
      
      setActivePrayer(active);
    };

    checkActivePrayer();
    const interval = setInterval(checkActivePrayer, 60000); // Re-calculate every minute
    return () => clearInterval(interval);
  }, [prayerTimes]);

  return (
    <main className="w-screen h-screen flex flex-col p-6 gap-6 justify-between select-none">
      {/* 1. Header Row */}
      <div className="flex-none">
        <Header 
          mosqueName={settings.mosque_name} 
          location={settings.location} 
          hijriOffset={settings.hijri_date_offset} 
        />
      </div>

      {/* 2. Middle Grid (Clock & Slider on Left, Content & Announcements on Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 overflow-hidden">
        {/* Left Columns (Span 2/3 of grid) */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full min-h-0">
          <div className="flex-none">
            <Clock prayerTimes={prayerTimes} />
          </div>
          <div className="flex-1 min-h-0">
            <MediaSlider images={sliderImages} />
          </div>
        </div>

        {/* Right Column (Span 1/3 of grid) */}
        <div className="lg:col-span-1 h-full min-h-0">
          <RealtimeContent 
            initialAnnouncements={announcements} 
            initialQuotes={quotes} 
          />
        </div>
      </div>

      {/* 3. Bottom Row (Prayer Times Grid) */}
      <div className="flex-none">
        <PrayerTimes 
          prayerTimes={prayerTimes} 
          activePrayer={activePrayer} 
        />
      </div>
    </main>
  );
}
