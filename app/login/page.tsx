"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  HeartHandshake,
  Lock,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donor");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const userRole = profile?.role || role;

      if (userRole === "shelter") {
        window.location.href = "/shelter";
      } else if (userRole === "volunteer") {
        window.location.href = "/volunteer";
      } else {
        window.location.href = "/dashboard";
      }
    }

    setLoading(false);
  }

  return (
    <main className="rw-page min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-[#1d3028] bg-[#0d1915] lg:grid-cols-[1fr_0.9fr]">

          {/* Left */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden border-r border-[#1d3028] p-10 lg:flex lg:flex-col lg:justify-between"
          >
            <div>
              <Link
                href="/"
                className="mb-12 inline-flex items-center gap-2 text-sm text-[#8d9b95] transition hover:text-white"
              >
                <ArrowLeft size={16} />
                Back to RescueWavy
              </Link>

              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#39d98a]/10 text-[#39d98a]">
                <HeartHandshake size={25} />
              </div>

              <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-[#39d98a]">
                RescueWavy
              </p>

              <h1 className="max-w-md text-4xl font-semibold leading-tight text-white">
                Good food should reach someone who needs it.
              </h1>

              <p className="mt-5 max-w-md leading-7 text-[#8d9b95]">
                Connect surplus food with shelters and volunteers through one
                simple rescue network.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1d3028] bg-[#101f1a] p-5">
              <div className="mb-3 flex items-center gap-2 text-[#39d98a]">
                <ShieldCheck size={18} />
                <span className="text-sm font-medium">Built for the rescue flow</span>
              </div>

              <p className="text-sm leading-6 text-[#8d9b95]">
                Donors post food, shelters confirm the rescue, and volunteers
                move it to where it is needed.
              </p>
            </div>
          </motion.section>

          {/* Right */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-7 sm:p-10"
          >
            <div className="mx-auto max-w-md">

              <Link
                href="/"
                className="mb-8 inline-flex items-center gap-2 text-sm text-[#8d9b95] lg:hidden"
              >
                <ArrowLeft size={16} />
                RescueWavy
              </Link>

              <div className="mb-8">
                <p className="text-sm font-medium text-[#39d98a]">
                  Welcome back
                </p>

                <h2 className="mt-2 text-3xl font-semibold text-white">
                  Sign in to your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#8d9b95]">
                  Continue managing your part of the food rescue network.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">

                {/* Role */}
                <div>
                  <label className="rw-label">I am joining as</label>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ["donor", "Donor"],
                      ["shelter", "Shelter"],
                      ["volunteer", "Volunteer"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRole(value)}
                        className={`rounded-xl border px-3 py-3 text-sm transition ${
                          role === value
                            ? "border-[#39d98a] bg-[#39d98a]/10 text-[#39d98a]"
                            : "border-[#1d3028] bg-[#101f1a] text-[#8d9b95] hover:border-[#2b463b] hover:text-white"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="rw-label">Email</label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64756d]"
                    />

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="rw-input pl-11"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="rw-label">Password</label>

                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64756d]"
                    />

                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="rw-input pl-11"
                    />
                  </div>
                </div>

                {message && (
                  <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="rw-button-primary flex w-full items-center justify-center gap-2"
                >
                  {loading ? "Signing in..." : "Sign in"}
                  {!loading && <ArrowRight size={17} />}
                </button>
              </form>

              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#1d3028]" />
                <span className="text-xs text-[#64756d]">NEW HERE?</span>
                <div className="h-px flex-1 bg-[#1d3028]" />
              </div>

              <Link
                href="/signup"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1d3028] px-5 py-3 text-sm font-medium text-white transition hover:border-[#39d98a]/40 hover:bg-[#101f1a]"
              >
                <UserRound size={17} />
                Create an account
              </Link>

            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}