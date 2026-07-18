'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Megaphone, BookOpen, User } from 'lucide-react';

interface Announcement {
  id: string;
  content: string;
  is_active: boolean;
}

interface Quote {
  id: string;
  quote_text: string;
  author: string;
  is_active: boolean;
}

interface RealtimeContentProps {
  initialAnnouncements: Announcement[];
  initialQuotes: Quote[];
}

export default function RealtimeContent({
  initialAnnouncements,
  initialQuotes,
}: RealtimeContentProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Subscribe to changes in public tables
  useEffect(() => {
    // 1. Listen for Announcements
    const announcementChannel = supabase
      .channel('realtime_announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;

          if (eventType === 'INSERT') {
            const row = newRow as Announcement;
            if (row.is_active) {
              setAnnouncements((prev) => [...prev, row]);
            }
          } else if (eventType === 'UPDATE') {
            const row = newRow as Announcement;
            if (row.is_active) {
              setAnnouncements((prev) => {
                const index = prev.findIndex((item) => item.id === row.id);
                if (index !== -1) {
                  const updated = [...prev];
                  updated[index] = row;
                  return updated;
                }
                return [...prev, row];
              });
            } else {
              setAnnouncements((prev) => prev.filter((item) => item.id === row.id));
            }
          } else if (eventType === 'DELETE') {
            const row = oldRow as Partial<Announcement>;
            setAnnouncements((prev) => prev.filter((item) => item.id !== row.id));
          }
        }
      )
      .subscribe();

    // 2. Listen for Quotes
    const quoteChannel = supabase
      .channel('realtime_quotes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quotes' },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;

          if (eventType === 'INSERT') {
            const row = newRow as Quote;
            if (row.is_active) {
              setQuotes((prev) => [...prev, row]);
            }
          } else if (eventType === 'UPDATE') {
            const row = newRow as Quote;
            if (row.is_active) {
              setQuotes((prev) => {
                const index = prev.findIndex((item) => item.id === row.id);
                if (index !== -1) {
                  const updated = [...prev];
                  updated[index] = row;
                  return updated;
                }
                return [...prev, row];
              });
            } else {
              setQuotes((prev) => prev.filter((item) => item.id !== row.id));
            }
          } else if (eventType === 'DELETE') {
            const row = oldRow as Partial<Quote>;
            setQuotes((prev) => prev.filter((item) => item.id !== row.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(announcementChannel);
      supabase.removeChannel(quoteChannel);
    };
  }, []);

  // Cycle quotes every 15 seconds
  useEffect(() => {
    if (quotes.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [quotes]);

  const activeQuote = quotes[currentQuoteIndex] || null;

  return (
    <div className="w-full flex flex-col gap-6 h-full justify-between">
      {/* 1. Announcements (Informasi Masjid) - Large Top Section */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col relative overflow-hidden h-[75%] border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
        <div className="absolute -left-4 top-4 opacity-5 text-emerald-400">
          <Megaphone className="w-24 h-24" />
        </div>

        <div className="flex-none flex items-center gap-2 mb-4 pb-3 border-b border-white/5 z-10">
          <Megaphone className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase">
            Informasi & Kegiatan Masjid
          </span>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1 z-10">
          {announcements.length > 0 ? (
            announcements.map((ann) => (
              <div 
                key={ann.id} 
                className="p-4 rounded-2xl bg-white/2 border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/2 transition-all duration-300 flex gap-3 items-start"
              >
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0 mt-1.5 shadow-[0_0_8px_#f97316]" />
                <p className="text-slate-200 text-sm font-medium leading-relaxed">
                  {ann.content}
                </p>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <span className="text-xs uppercase tracking-widest">Tidak ada pengumuman hari ini</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Quote / Islamic Wisdom Section - Small Bottom Section */}
      <div className="h-[20%] glass-panel-glow rounded-2xl flex flex-col justify-center px-6 relative overflow-hidden border border-emerald-500/20 shadow-lg py-3">
        <div className="absolute -right-4 -bottom-4 opacity-5 text-emerald-400">
          <BookOpen className="w-16 h-16" />
        </div>
        
        {activeQuote ? (
          <div className="flex flex-col justify-center transition-all duration-500 z-10">
            <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Mutiara Hikmah
            </p>
            <p className="text-white text-xs md:text-sm font-medium italic line-clamp-2 leading-relaxed">
              "{activeQuote.quote_text}"
            </p>
            <p className="text-slate-400 font-bold text-[10px] uppercase mt-0.5 self-end">
              — {activeQuote.author || 'Anonim'}
            </p>
          </div>
        ) : (
          <div className="text-slate-400 text-xs uppercase tracking-widest text-center">
            Memuat Mutiara Hikmah...
          </div>
        )}
      </div>
    </div>
  );
}
