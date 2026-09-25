"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  HeartHandshake,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donor");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          phone,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      setSuccess(true);

      setTimeout(() => {
        window.location.href = "/login";
      }, 1800);
    }

    setLoading(false);
  }

  return (
    <main className="rw-page min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-[#1d3028] bg-[#0d1915] lg:grid-cols-[0.9fr_1fr]">

          {/* Left panel */}
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
                Join the network
              </p>

              <h1 className="max-w-md text-4xl font-semibold leading-tight text-white">
                Turn surplus food into someone's next meal.
              </h1>

              <p className="mt-5 max-w-md leading-7 text-[#8d9b95]">
                Create your RescueWavy account and become part of the rescue
                process.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Post surplus food",
                "Connect with shelters",
                "Help coordinate pickups",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-[#1d3028] bg-[#101f1a] px-4 py-3"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#39d98a]/10 text-[#39d98a]">
                    <ShieldCheck size={15} />
                  </div>

                  <span className="text-sm text-[#cbd4d0]">{item}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Signup form */}
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

              <div className="mb-7">
                <p className="text-sm font-medium text-[#39d98a]">
                  Get started
                </p>

                <h2 className="mt-2 text-3xl font-semibold text-white">
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#8d9b95]">
                  Choose your role and join the rescue network.
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">

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

                {/* Name */}
                <div>
                  <label className="rw-label">Full name</label>

                  <div className="relative">
                    <UserRound
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64756d]"
                    />

                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="rw-input pl-11"
                    />
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

                {/* Phone */}
                <div>
                  <label className="rw-label">
                    Phone <span className="text-[#64756d]">(optional)</span>
                  </label>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64756d]"
                    />

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
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
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="rw-input pl-11"
                    />
                  </div>
                </div>

                {message && (
                  <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                    {message}
                  </div>
                )}

                {success && (
                  <div className="rounded-xl border border-[#39d98a]/30 bg-[#39d98a]/10 px-4 py-3 text-sm text-[#8ff0bd]">
                    Account created successfully. Redirecting to login...
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || success}
                  className="rw-button-primary flex w-full items-center justify-center gap-2"
                >
                  {loading ? "Creating account..." : "Create account"}
                  {!loading && !success && <ArrowRight size={17} />}
                </button>
              </form>

              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#1d3028]" />
                <span className="text-xs text-[#64756d]">ALREADY A MEMBER?</span>
                <div className="h-px flex-1 bg-[#1d3028]" />
              </div>

              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1d3028] px-5 py-3 text-sm font-medium text-white transition hover:border-[#39d98a]/40 hover:bg-[#101f1a]"
              >
                Sign in instead
              </Link>

            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}