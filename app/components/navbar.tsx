"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BarChart3,
  Menu,
  Plus,
  X,
} from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1d3028] bg-[#07100d]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* BRAND */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#39d98a] text-sm font-black text-[#07100d]">
            R
          </div>

          <span className="text-lg font-bold tracking-tight text-white">
            RescueWavy
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden items-center gap-7 md:flex">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-[#8d9b95] transition hover:text-white"
          >
            <BarChart3 size={16} />
            Dashboard
          </Link>

          <Link
            href="/donate"
            className="flex items-center gap-2 text-sm text-[#8d9b95] transition hover:text-white"
          >
            <Plus size={16} />
            Donate Food
          </Link>

          <div className="ml-2 h-5 w-px bg-[#1d3028]" />

          <Link
            href="/login"
            className="rounded-xl border border-[#1d3028] px-4 py-2.5 text-sm font-semibold text-[#dce4e0] transition hover:border-[#315443] hover:bg-[#0d1915]"
          >
            Login
          </Link>

          <Link
            href="/donate"
            className="rounded-xl bg-[#39d98a] px-5 py-2.5 text-sm font-bold text-[#07100d] transition hover:bg-[#55e39d]"
          >
            Get Started
          </Link>
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1d3028] text-[#dce4e0] md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="border-t border-[#1d3028] bg-[#07100d] px-6 py-5 md:hidden">
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-[#8d9b95] hover:bg-[#0d1915] hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/donate"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-[#8d9b95] hover:bg-[#0d1915] hover:text-white"
            >
              Donate Food
            </Link>

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-[#8d9b95] hover:bg-[#0d1915] hover:text-white"
            >
              Login
            </Link>

            <Link
              href="/donate"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl bg-[#39d98a] px-4 py-3 text-center text-sm font-bold text-[#07100d]"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}