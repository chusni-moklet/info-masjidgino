'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, MapPin, CalendarDays } from 'lucide-react';

interface HeaderProps {
  mosqueName: string;
  location: string;
  hijriOffset?: number;
}

export default function Header({
  mosqueName = 'Masjid Gino Sugiono',
  location = 'Perumahan Skyland 2',
  hijriOffset = 0,
}: HeaderProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  // Helper: Get Jakarta time (GMT+7)
  const getJakartaTime = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const jakartaOffset = 7;
    return new Date(utc + 3600000 * jakartaOffset);
  };

  useEffect(() => {
    setCurrentDate(getJakartaTime());
    const interval = setInterval(() => {
      setCurrentDate(getJakartaTime());
    }, 60000); // Update dates every minute
    return () => clearInterval(interval);
  }, []);

  // Standard Tabular Islamic Calendar Algorithm
  const getHijriDateText = (date: Date, offset: number) => {
    // Apply user-configured day offset
    const adjustedDate = new Date(date.getTime() + offset * 24 * 60 * 60 * 1000);
    
    const gDate = adjustedDate.getDate();
    const gMonth = adjustedDate.getMonth() + 1; // getMonth is 0-indexed
    const gYear = adjustedDate.getFullYear();
    
    // Julian day calculation
    let jd;
    if ((gYear > 1582) || ((gYear === 1582) && (gMonth > 10)) || ((gYear === 1582) && (gMonth === 10) && (gDate > 14))) {
      jd = Math.floor(367 * gYear - Math.floor(7 * (gYear + Math.floor((gMonth + 9) / 12)) / 4) + Math.floor(275 * gMonth / 9) + gDate + 1721029) - Math.floor(3 * (Math.floor((gYear + 4900 + Math.floor((gMonth - 9) / 7)) / 100)) / 4) + 38;
    } else {
      jd = Math.floor(367 * gYear - Math.floor(7 * (gYear + 5001 + Math.floor((gMonth - 9) / 7)) / 4) + Math.floor(275 * gMonth / 9) + gDate + 1721028);
    }
    
    let l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    const j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
    l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    
    let hMonth = Math.floor(24 * l / 709);
    const hDate = l - Math.floor(709 * hMonth / 24);
    const hYear = 30 * n + j - 30;
    
    const hijriMonths = [
      'Muharram', 'Safar', 'Rabi’ul Awwal', 'Rabi’ul Akhir',
      'Jumadil Awwal', 'Jumadil Akhir', 'Rajab', 'Sya’ban',
      'Ramadhan', 'Syawwal', 'Dzulqa’dah', 'Dzulhijjah'
    ];
    
    // Safety check for month index
    hMonth = Math.max(0, Math.min(11, hMonth));
    
    return `${hDate} ${hijriMonths[hMonth]} ${hYear} H`;
  };

  const hijriString = currentDate ? getHijriDateText(currentDate, hijriOffset) : 'Memuat Tanggal...';

  return (
    <div className="w-full glass-panel rounded-3xl p-6 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
      
      {/* Mosque Identity */}
      <div className="flex items-center gap-4 z-10">
        <div className="bg-white p-2 rounded-2xl border border-orange-500/20 w-16 h-16 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo Masjid" className="max-w-full max-h-full object-contain" />
        </div>
        
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase">
            {mosqueName}
          </h1>
          <div className="flex items-center gap-2 text-slate-400 mt-1 text-sm font-semibold tracking-wider">
            <MapPin className="w-4 h-4 text-rose-500" />
            {location}
          </div>
        </div>
      </div>

      {/* Date Display */}
      <div className="flex flex-col md:items-end justify-center z-10 text-center md:text-right">
        <div className="flex items-center gap-2 text-emerald-400 font-bold tracking-widest text-lg md:text-xl uppercase">
          <CalendarDays className="w-5 h-5" />
          {hijriString}
        </div>
        <p className="text-slate-300 text-xs font-semibold tracking-wider uppercase mt-1">
          Digital Signage TV Masjid
        </p>
      </div>
    </div>
  );
}
