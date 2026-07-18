'use client';

import React, { useEffect, useState } from 'react';
import { format, differenceInSeconds } from 'date-fns';
import { id } from 'date-fns/locale';
import { Clock as ClockIcon, BellRing } from 'lucide-react';

interface PrayerTime {
  name: string;
  time: string; // format "HH:MM"
}

interface ClockProps {
  prayerTimes: PrayerTime[];
  hijriOffset?: number;
}

export default function Clock({ prayerTimes, hijriOffset = 0 }: ClockProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<{ name: string; text: string; secondsLeft: number } | null>(null);

  // Helper: Get current time adjusted to Asia/Jakarta (UTC+7)
  const getJakartaTime = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const jakartaOffset = 7; // WIB is UTC+7
    return new Date(utc + 3600000 * jakartaOffset);
  };

  useEffect(() => {
    // Set initial time
    setCurrentTime(getJakartaTime());

    const timer = setInterval(() => {
      setCurrentTime(getJakartaTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentTime || prayerTimes.length === 0) return;

    // Helper: Parse "HH:MM" into a Date object for today
    const parseTimeToday = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date(currentTime);
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    // Find next prayer
    let nextPrayer: PrayerTime | null = null;
    let nextPrayerTime: Date | null = null;
    let minDiff = Infinity;

    // We check all prayer times today
    prayerTimes.forEach((p) => {
      const pTime = parseTimeToday(p.time);
      const diff = differenceInSeconds(pTime, currentTime);

      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        nextPrayer = p;
        nextPrayerTime = pTime;
      }
    });

    // If all prayers today have passed, the next prayer is the first prayer of tomorrow
    if (!nextPrayer && prayerTimes.length > 0) {
      // Find the earliest prayer (usually Imsak or Subuh)
      const sorted = [...prayerTimes].sort((a, b) => a.time.localeCompare(b.time));
      const firstPrayer = sorted[0];
      const tomorrowTime = parseTimeToday(firstPrayer.time);
      tomorrowTime.setDate(tomorrowTime.getDate() + 1);

      nextPrayer = firstPrayer;
      nextPrayerTime = tomorrowTime;
      minDiff = differenceInSeconds(tomorrowTime, currentTime);
    }

    if (nextPrayer && nextPrayerTime) {
      const seconds = minDiff;
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;

      const timeText = [
        h > 0 ? String(h).padStart(2, '0') : null,
        String(m).padStart(2, '0'),
        String(s).padStart(2, '0'),
      ]
        .filter(Boolean)
        .join(':');

      setCountdown({
        name: (nextPrayer as PrayerTime).name,
        text: timeText,
        secondsLeft: seconds,
      });
    }
  }, [currentTime, prayerTimes]);

  if (!currentTime) {
    return (
      <div className="flex items-center justify-center h-28 glass-panel rounded-2xl animate-pulse">
        <span className="text-emerald-400 text-lg">Loading Clock...</span>
      </div>
    );
  }

  // Format date display in Indonesian locale
  const formattedDay = format(currentTime, 'EEEE', { locale: id });
  const formattedDate = format(currentTime, 'dd MMMM yyyy', { locale: id });
  const timeString = format(currentTime, 'HH:mm:ss');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Realtime Time Display */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col justify-center items-center relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl" />
        
        <span className="text-slate-400 text-sm font-medium tracking-widest uppercase mb-1 flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-emerald-400" />
          Waktu Jakarta (WIB)
        </span>
        
        <h1 className="text-6xl md:text-7xl font-extrabold font-mono tracking-wider text-white glow-green">
          {timeString}
        </h1>
        
        <p className="text-slate-300 text-lg mt-2 font-medium">
          {formattedDay}, {formattedDate}
        </p>
      </div>

      {/* Countdown Display */}
      <div className="glass-panel-glow rounded-3xl p-6 flex flex-col justify-center items-center relative overflow-hidden border border-emerald-500/20 shadow-2xl">
        <div className="absolute -right-8 -bottom-8 opacity-5 text-emerald-500">
          <BellRing className="w-36 h-36" />
        </div>
        
        {countdown ? (
          <>
            <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-1 flex items-center gap-2 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
              Menuju Sholat Berikutnya
            </span>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Adzan <span className="text-emerald-400">{countdown.name}</span>
            </h2>
            
            <div className="text-5xl md:text-6xl font-black font-mono tracking-widest text-emerald-300 glow-green">
              {countdown.text}
            </div>
            
            {countdown.secondsLeft <= 300 && (
              <div className="mt-2 text-xs font-semibold uppercase px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full animate-bounce">
                Persiapan Adzan / Segera Berwudhu
              </div>
            )}
          </>
        ) : (
          <div className="text-slate-400 text-lg">Menghitung Jadwal...</div>
        )}
      </div>
    </div>
  );
}
