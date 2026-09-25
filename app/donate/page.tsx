"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Info,
  Loader2,
  MapPin,
  Package,
  Sparkles,
  Truck,
  Utensils,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AIResult = {
  category: string;
  items: string[];
  keywords: string[];
  summary: string;
};

const inputClass =
  "rw-input w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#53615b]";

const labelClass =
  "mb-2 block text-sm font-medium text-[#dce4e0]";

export default function DonatePage() {
  const [donorName, setDonorName] = useState("");
  const [organization, setOrganization] = useState("");
  const [foodDescription, setFoodDescription] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiry, setExpiry] = useState("");
  const [location, setLocation] = useState("");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function analyzeWithAI() {
    if (!foodDescription.trim()) {
      alert("Please enter a food description first.");
      return;
    }

    setAiLoading(true);
    setAiResult(null);

    try {
      const response = await fetch("/api/ai/parse-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: foodDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI processing failed.");
      }

      setAiResult(data);

      if (data.category) {
        setCategory(data.category);
      }
    } catch (error) {
      console.error("AI analysis error:", error);
      alert("AI analysis failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!foodDescription.trim()) {
      alert("Please enter a food description.");
      return;
    }

    if (!category) {
      alert("Please select a food category.");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (!expiry) {
      alert("Please enter the food availability time.");
      return;
    }

    if (!location.trim()) {
      alert("Please enter the pickup location.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Please login before submitting a donation.");
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("donations")
        .insert({
          donor_id: user.id,
          food_description: foodDescription.trim(),
          food_category: category,
          quantity_kg: Number(quantity),
          expiry_time: new Date(expiry).toISOString(),
          location: location.trim(),
          status: "available",
        })
        .select()
        .single();

      if (error) {
        console.error("Donation error:", error);
        alert(error.message);
        return;
      }

      localStorage.setItem("currentDonationId", data.id);

      setDonorName("");
      setOrganization("");
      setFoodDescription("");
      setCategory("");
      setQuantity("");
      setExpiry("");
      setLocation("");
      setAiResult(null);

      setSubmitted(true);
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- SUCCESS ---------------- */

  if (submitted) {
    return (
      <main className="rw-page min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-20">
          <div className="w-full text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#28583f] bg-[#10271d]">
              <CheckCircle2 size={32} className="text-[#39d98a]" />
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.18em] text-[#39d98a]">
              Rescue created
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Donation submitted.
            </h1>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-[#8d9b95]">
              Your surplus food has been added to RescueWavy. The next step is
              finding a suitable shelter match.
            </p>

            <div className="mx-auto mt-10 max-w-md rounded-2xl border border-[#1d3028] bg-[#0d1915] p-5 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10271d]">
                  <MapPin size={18} className="text-[#39d98a]" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    Next step
                  </p>
                  <p className="mt-1 text-xs text-[#718079]">
                    Find a suitable shelter for this donation
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/match"
                className="rw-button-primary inline-flex items-center gap-2"
              >
                Find shelter match
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/dashboard"
                className="rw-button-secondary inline-flex items-center gap-2"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ---------------- MAIN PAGE ---------------- */

  return (
    <main className="rw-page min-h-screen">
      {/* TOP BAR */}
      <div className="border-b border-[#1d3028]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#8d9b95] transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to RescueWavy
          </Link>

          <Link
            href="/dashboard"
            className="text-sm text-[#8d9b95] transition hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* HEADER */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#39d98a]">
              <Package size={16} />
              Food rescue
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
              Tell us what you have.
              <br />
              <span className="text-[#39d98a]">We&apos;ll handle the next step.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-[#8d9b95] md:text-lg">
              Add a few details about your surplus food. RescueWavy can
              analyse the description, classify the food and prepare it for
              shelter matching.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="pb-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-[1fr_320px]">
          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="rw-card overflow-hidden"
          >
            {/* FORM HEADER */}
            <div className="border-b border-[#1d3028] px-6 py-6 md:px-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#1d3028] bg-[#101f1a]">
                  <FileText size={19} className="text-[#39d98a]" />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Donation details
                  </h2>

                  <p className="mt-1 text-sm text-[#718079]">
                    Fields marked with * are required.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8 p-6 md:p-8">
              {/* DONOR */}
              <div>
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#39d98a]">
                    About you
                  </p>

                  <p className="mt-1 text-sm text-[#718079]">
                    Optional information for this prototype.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Donor name
                    </label>

                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Organization / event
                    </label>

                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="College, restaurant, event..."
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* FOOD DESCRIPTION */}
              <div>
                <label className={labelClass}>
                  Food description <span className="text-[#39d98a]">*</span>
                </label>

                <textarea
                  value={foodDescription}
                  onChange={(e) => setFoodDescription(e.target.value)}
                  placeholder="Example: Around 12 kg of cooked rice and dal left after our college event"
                  rows={6}
                  className={`${inputClass} resize-y`}
                />

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-2 text-xs text-[#5f6e68]">
                    <Info size={14} />
                    Describe the food naturally. You don't need special
                    formatting.
                  </p>

                  <button
                    type="button"
                    onClick={analyzeWithAI}
                    disabled={aiLoading || !foodDescription.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#28583f] bg-[#10271d] px-4 py-2.5 text-sm font-semibold text-[#65e0a0] transition hover:bg-[#153323] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Analysing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Analyse with AI
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI RESULT */}
              {aiResult && (
                <div className="overflow-hidden rounded-2xl border border-[#28583f] bg-[#0c1c14]">
                  <div className="flex items-center justify-between border-b border-[#1d3028] px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#10271d]">
                        <Sparkles size={17} className="text-[#39d98a]" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-white">
                          AI suggestion
                        </p>

                        <p className="text-xs text-[#718079]">
                          Review before submitting
                        </p>
                      </div>
                    </div>

                    <CheckCircle2
                      size={18}
                      className="text-[#39d98a]"
                    />
                  </div>

                  <div className="grid gap-5 p-5 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-[#718079]">
                        Suggested category
                      </p>

                      <p className="mt-1 font-semibold capitalize text-white">
                        {aiResult.category}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#718079]">
                        Food items
                      </p>

                      <p className="mt-1 text-sm text-[#dce4e0]">
                        {aiResult.items?.join(", ") || "Not identified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#718079]">
                        Keywords
                      </p>

                      <p className="mt-1 text-sm text-[#dce4e0]">
                        {aiResult.keywords?.join(", ") || "Not identified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#718079]">
                        Summary
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#dce4e0]">
                        {aiResult.summary}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#1d3028] px-5 py-3">
                    <p className="text-xs text-[#5f6e68]">
                      AI suggested the category. You can change it manually
                      below.
                    </p>
                  </div>
                </div>
              )}

              {/* CATEGORY + QUANTITY */}
              <div>
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#39d98a]">
                    Food details
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Food category{" "}
                      <span className="text-[#39d98a]">*</span>
                    </label>

                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select category</option>
                      <option value="cooked">Cooked Food</option>
                      <option value="fruits">Fruits</option>
                      <option value="packaged">Packaged Food</option>
                      <option value="bakery">Bakery</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Quantity (kg){" "}
                      <span className="text-[#39d98a]">*</span>
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Example: 12"
                        className={`${inputClass} pr-12`}
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#5f6e68]">
                        kg
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TIME + LOCATION */}
              <div>
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#39d98a]">
                    Pickup details
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Food available until{" "}
                      <span className="text-[#39d98a]">*</span>
                    </label>

                    <div className="relative">
                      <Clock3
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5f6e68]"
                      />

                      <input
                        type="datetime-local"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Pickup location{" "}
                      <span className="text-[#39d98a]">*</span>
                    </label>

                    <div className="relative">
                      <MapPin
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5f6e68]"
                      />

                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Example: Amity University Rajasthan"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SUBMIT */}
              <div className="border-t border-[#1d3028] pt-7">
                <button
                  type="submit"
                  disabled={loading}
                  className="rw-button-primary flex w-full items-center justify-center gap-2 py-4 text-base disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting donation...
                    </>
                  ) : (
                    <>
                      Submit donation
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-[#5f6e68]">
                  AI assists with food classification. Quantity and
                  availability information should be provided by the donor.
                </p>
              </div>
            </div>
          </form>

          {/* SIDE PANEL */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rw-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10271d]">
                <Truck size={19} className="text-[#39d98a]" />
              </div>

              <h3 className="mt-5 font-semibold text-white">
                What happens next?
              </h3>

              <div className="mt-5 space-y-5">
                <div className="flex gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#39d98a]" />

                  <div>
                    <p className="text-sm font-medium text-white">
                      Donation is recorded
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#718079]">
                      Your surplus becomes available for matching.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#39d98a]" />

                  <div>
                    <p className="text-sm font-medium text-white">
                      Shelter match
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#718079]">
                      Suitable shelters can be considered for the donation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#39d98a]" />

                  <div>
                    <p className="text-sm font-medium text-white">
                      Pickup
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#718079]">
                      A volunteer can coordinate the movement of the food.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rw-card p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Info size={17} className="text-[#39d98a]" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    Keep the details accurate
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#718079]">
                    The AI helps organise your description, but the donor is
                    responsible for the quantity and availability information.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}