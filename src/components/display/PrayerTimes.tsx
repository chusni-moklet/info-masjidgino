'use client';

import React, { useEffect, useState } from 'react';

interface PrayerTime {
  name: string;
  time: string;
}

interface PrayerTimesProps {
  prayerTimes: PrayerTime[];
  activePrayer: string | null;
}

export default function PrayerTimes({ prayerTimes, activePrayer }: PrayerTimesProps) {
  return (
    <div className="w-full">
      <h3 className="text-slate-300 text-lg font-semibold tracking-wider mb-4 text-center md:text-left">
        Jadwal Sholat Hari Ini (Malang Raya)
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {prayerTimes.map((pt) => {
          const isActive = activePrayer === pt.name;
          
          return (
            <div
              key={pt.name}
              className={`glass-panel rounded-2xl p-4 flex flex-col items-center justify-center transition-all duration-500 border ${
                isActive 
                  ? 'active-prayer-card border-emerald-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] scale-105' 
                  : 'border-white/5 hover:border-white/20'
              }`}
            >
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}>
                {pt.name}
              </span>
              
              <span className={`text-3xl font-extrabold font-mono mt-2 tracking-wide ${
                isActive ? 'text-white' : 'text-slate-200'
              }`}>
                {pt.time}
              </span>
              
              {isActive && (
                <span className="mt-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse">
                  Sekarang
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
