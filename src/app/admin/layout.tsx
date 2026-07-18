'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Landmark, 
  Megaphone, 
  BookOpen, 
  Image as ImageIcon, 
  Settings, 
  Tv, 
  LogOut, 
  UserCheck 
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  // 1. Auth Guard Logic
  useEffect(() => {
    // If it's the login page, bypass authentication checks
    if (pathname === '/admin/login') {
      setAuthenticated(true);
      return;
    }

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAuthenticated(false);
        router.push('/admin/login');
      } else {
        setAuthenticated(true);
        setUserEmail(session.user?.email || 'admin@masjid.com');
      }
    }

    checkAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (pathname === '/admin/login') return;
      
      if (!session) {
        setAuthenticated(false);
        router.push('/admin/login');
      } else {
        setAuthenticated(true);
        setUserEmail(session.user?.email || 'admin@masjid.com');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Clear cookie
    document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax; Secure';
    router.push('/admin/login');
  };

  // While checking auth state, show loading spinner
  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-[#070c19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm font-semibold uppercase tracking-widest animate-pulse">
            Memeriksa Sesi...
          </span>
        </div>
      </div>
    );
  }

  // Bypass layout markup if it's the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const menuItems = [
    { name: 'Pengaturan Masjid', path: '/admin', icon: Settings },
    { name: 'Pengumuman Ticker', path: '/admin/announcements', icon: Megaphone },
    { name: 'Mutiara Hikmah', path: '/admin/quotes', icon: BookOpen },
    { name: 'Slider Gambar', path: '/admin/slider', icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen flex bg-[#070c19] text-slate-100 select-text">
      {/* Sidebar Navigation */}
      <aside className="w-80 shrink-0 bg-[#091124] border-r border-white/5 p-6 flex flex-col justify-between">
        <div className="flex flex-col gap-8">
          {/* Logo Branding */}
          <div className="flex items-center gap-3 py-2 border-b border-white/5">
            <div className="bg-white p-1.5 rounded-xl border border-orange-500/20 w-11 h-11 flex items-center justify-center overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Logo Masjid" className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-md tracking-wider">PANEL MASJID</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Gino Sugiono</p>
            </div>
          </div>

          {/* User info */}
          <div className="p-3 bg-slate-900/40 rounded-xl flex items-center gap-3 border border-white/5">
            <div className="h-8 w-8 bg-emerald-500 text-slate-950 font-bold flex items-center justify-center rounded-lg text-sm">
              AD
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-slate-200 truncate">{userEmail}</div>
              <div className="text-[9px] text-emerald-400 uppercase font-bold flex items-center gap-1 mt-0.5">
                <UserCheck className="w-2.5 h-2.5" />
                Administrator
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
              MENU UTAMA
            </span>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-emerald-600/20 border border-emerald-500/20 text-emerald-300 font-bold'
                      : 'text-slate-400 hover:bg-slate-900/30 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions (Public View and Logout) */}
        <div className="flex flex-col gap-2 pt-6 border-t border-white/5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors border border-white/5"
          >
            <Tv className="w-4 h-4 text-emerald-400" />
            Buka Layar TV
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors border border-rose-500/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-8 overflow-y-auto no-scrollbar">
        {children}
      </main>
    </div>
  );
}
