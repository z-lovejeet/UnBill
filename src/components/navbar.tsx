'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { History, ArrowUpRight } from 'lucide-react';
import { useAuditStore } from '@/lib/store';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const history = useAuditStore((state) => state.history);

  useEffect(() => {
    useAuditStore.persist.rehydrate();
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/logo.png"
              alt="UnBill Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-slate-950 tracking-[-0.03em] leading-none flex items-center gap-1.5 font-sans">
              UnBill{' '}
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60">
                Forensic AI
              </span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium font-sans">
              Patient Financial Defense
            </span>
          </div>
        </Link>

        {/* Right Navigation */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-medium font-sans">
          <Link
            href="/about"
            className={`px-2.5 py-1.5 rounded-lg transition-colors ${
              pathname === '/about'
                ? 'text-slate-950 font-bold bg-slate-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            About
          </Link>

          <Link
            href="/privacy"
            className={`px-2.5 py-1.5 rounded-lg transition-colors hidden sm:inline-block ${
              pathname === '/privacy'
                ? 'text-slate-950 font-bold bg-slate-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            Privacy
          </Link>

          <Link
            href="/history"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
              pathname === '/history'
                ? 'text-slate-950 font-bold bg-slate-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>Vault</span>
            {mounted && history.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono bg-slate-200 text-slate-700 rounded-full font-semibold">
                {history.length}
              </span>
            )}
          </Link>

          <Link
            href="/scan"
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <span>Audit a Bill</span>
            <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
              <ArrowUpRight className="w-3 h-3 text-slate-300" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
