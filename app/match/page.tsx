"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  MapPin,
  Package,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Truck,
  Utensils,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

type Donation = {
  id: string;
  food_description: string;
  food_category: string;
  quantity_kg: number;
  expiry_time: string;
  location: string;
  status: string;
};

type MatchData = {
  id: string;
  status: string;
  score: number;
  distance_km: number;
  shelter: {
    id: string;
    name: string;
    address: string;
    capacity_kg: number;
    accepted_food_types: string[];
    status: string;
  };
};

export default function MatchPage() {
  const supabase = createClient();

  const [donation, setDonation] = useState<Donation | null>(null);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCurrentMatch();
  }, []);

  async function loadCurrentMatch() {
    setLoading(true);
    setError("");

    try {
      const donationId = localStorage.getItem("currentDonationId");

      if (!donationId) {
        setError(
          "No current donation was found. Please create a donation first."
        );
        return;
      }

      const { data: donationData, error: donationError } =
        await supabase
          .from("donations")
          .select("*")
          .eq("id", donationId)
          .single();

      if (donationError || !donationData) {
        throw new Error("Could not find your donation.");
      }

      setDonation(donationData);

      const { data: matchData, error: matchError } =
        await supabase
          .from("matches")
          .select(
            `
              id,
              status,
              score,
              distance_km,
              shelter:shelters (
                id,
                name,
                address,
                capacity_kg,
                accepted_food_types,
                status
              )
            `
          )
          .eq("donation_id", donationId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (matchError) {
        throw new Error("Could not load the shelter match.");
      }

      if (!matchData) {
        throw new Error(
          "No shelter has been matched to this donation yet."
        );
      }

      const shelterData = Array.isArray(matchData.shelter)
        ? matchData.shelter[0]
        : matchData.shelter;

      if (!shelterData) {
        throw new Error("The matched shelter could not be found.");
      }

      const finalMatch: MatchData = {
        id: matchData.id,
        status: matchData.status,
        score: Number(matchData.score),
        distance_km: Number(matchData.distance_km),
        shelter: {
          id: shelterData.id,
          name: shelterData.name,
          address: shelterData.address,
          capacity_kg: Number(shelterData.capacity_kg),
          accepted_food_types:
            shelterData.accepted_food_types || [],
          status: shelterData.status,
        },
      };

      setMatch(finalMatch);
    } catch (err: any) {
      console.error("MATCH PAGE ERROR:", err);

      setError(
        err?.message ||
          "Something went wrong while loading the match."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="rw-page flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1d3028] bg-[#0d1915]">
            <Sparkles
              size={28}
              className="text-[#39d98a]"
            />
          </div>

          <h1 className="text-2xl font-bold text-white">
            Finding the right destination
          </h1>

          <p className="mt-2 text-sm text-[#8d9b95]">
            Checking the latest RescueWavy shelter assignment...
          </p>

          <div className="mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-[#1d3028]">
            <motion.div
              className="h-full rounded-full bg-[#39d98a]"
              initial={{ width: "10%" }}
              animate={{ width: "90%" }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </div>
        </motion.div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="rw-page flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rw-card w-full max-w-lg p-8 text-center"
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <RefreshCw
              size={25}
              className="text-red-400"
            />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-red-400">
            Match unavailable
          </p>

          <h1 className="text-2xl font-bold text-white">
            We couldn't load the match
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#8d9b95]">
            {error}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              onClick={loadCurrentMatch}
              className="rw-button-primary inline-flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try again
            </button>

            <Link
              href="/donate"
              className="rw-button-secondary inline-flex items-center gap-2"
            >
              New donation
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  if (!donation || !match) {
    return null;
  }

  const statusLabel =
    match.status === "suggested"
      ? "Awaiting confirmation"
      : match.status === "confirmed"
      ? "Rescue confirmed"
      : match.status.replace("_", " ");

  return (
    <main className="rw-page min-h-screen px-5 pb-16 pt-8 md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* TOP BAR */}

        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[#8d9b95] transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>

          <div className="hidden items-center gap-2 text-xs text-[#53615b] sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#39d98a]" />
            RescueWavy matching system
          </div>
        </div>

        {/* HEADER */}

        <motion.header
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#39d98a]">
            <Sparkles size={15} />
            Smart match
          </div>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white md:text-6xl">
            Your food has a destination.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-[#8d9b95]">
            RescueWavy found a shelter that matches your donation
            based on food type, capacity and distance.
          </p>
        </motion.header>

        {/* MAIN GRID */}

        <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">

          {/* DONATION CARD */}

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rw-card overflow-hidden"
          >
            <div className="border-b border-[#1d3028] px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#39d98a]/10 text-[#39d98a]">
                    <Package size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[#53615b]">
                      Your donation
                    </p>
                    <h2 className="font-bold text-white">
                      Food details
                    </h2>
                  </div>
                </div>

                <span className="rounded-full border border-[#39d98a]/20 bg-[#39d98a]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#39d98a]">
                  {donation.status}
                </span>
              </div>
            </div>

            <div className="p-6">

              <div className="mb-6 rounded-2xl border border-[#1d3028] bg-[#07100d] p-5">
                <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#53615b]">
                  <Utensils size={14} />
                  Food description
                </div>

                <p className="text-lg font-semibold leading-7 text-white">
                  {donation.food_description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-2xl border border-[#1d3028] bg-[#101f1a]/50 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-[#53615b]">
                    Category
                  </p>

                  <p className="mt-2 font-semibold capitalize text-white">
                    {donation.food_category}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#1d3028] bg-[#101f1a]/50 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-[#53615b]">
                    Quantity
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {donation.quantity_kg} kg
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl border border-[#1d3028] bg-[#101f1a]/50 p-4">
                  <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#53615b]">
                    <MapPin size={13} />
                    Pickup location
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {donation.location}
                  </p>
                </div>

              </div>
            </div>
          </motion.section>

          {/* SHELTER CARD */}

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="overflow-hidden rounded-[18px] border border-[#39d98a]/25 bg-[#0d1915]"
          >
            <div className="border-b border-[#1d3028] bg-[#39d98a]/[0.035] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#39d98a]/10 text-[#39d98a]">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[#39d98a]">
                    Matched shelter
                  </p>

                  <h2 className="font-bold text-white">
                    {match.shelter.name}
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-6">

              <div className="mb-6 flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-1 shrink-0 text-[#39d98a]"
                />

                <div>
                  <p className="text-xs uppercase tracking-wider text-[#53615b]">
                    Location
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#dce4e0]">
                    {match.shelter.address}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-2xl border border-[#1d3028] bg-[#07100d] p-4">
                  <Route
                    size={17}
                    className="mb-3 text-[#39d98a]"
                  />

                  <p className="text-[11px] uppercase tracking-wider text-[#53615b]">
                    Distance
                  </p>

                  <p className="mt-1 text-xl font-black text-white">
                    {match.distance_km} km
                  </p>
                </div>

                <div className="rounded-2xl border border-[#1d3028] bg-[#07100d] p-4">
                  <Package
                    size={17}
                    className="mb-3 text-[#39d98a]"
                  />

                  <p className="text-[11px] uppercase tracking-wider text-[#53615b]">
                    Capacity
                  </p>

                  <p className="mt-1 text-xl font-black text-white">
                    {match.shelter.capacity_kg} kg
                  </p>
                </div>

              </div>

              <div className="mt-4 rounded-2xl border border-[#1d3028] bg-[#07100d] p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs uppercase tracking-wider text-[#53615b]">
                    Match score
                  </span>

                  <span className="text-2xl font-black text-[#39d98a]">
                    {match.score}
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#1d3028]">
                  <div
                    className="h-full rounded-full bg-[#39d98a]"
                    style={{
                      width: `${Math.min(match.score, 100)}%`,
                    }}
                  />
                </div>
              </div>

            </div>
          </motion.section>
        </div>

        {/* STATUS */}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="rw-card mt-6 p-6"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-4">

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  match.status === "confirmed"
                    ? "bg-[#39d98a]/10 text-[#39d98a]"
                    : "bg-amber-400/10 text-amber-300"
                }`}
              >
                {match.status === "confirmed" ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <Clock3 size={22} />
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#53615b]">
                  Rescue status
                </p>

                <h3 className="mt-1 text-xl font-bold capitalize text-white">
                  {statusLabel}
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8d9b95]">
                  {match.status === "suggested" &&
                    `${match.shelter.name} has received the rescue request. The shelter needs to confirm it before a volunteer pickup is created.`}

                  {match.status === "confirmed" &&
                    "The shelter accepted this donation. A volunteer can now handle the pickup and delivery."}

                  {match.status !== "suggested" &&
                    match.status !== "confirmed" &&
                    `Current rescue status: ${match.status}.`}
                </p>
              </div>
            </div>

            {match.status === "confirmed" && (
              <Link
                href="/volunteer"
                className="rw-button-primary inline-flex shrink-0 items-center justify-center gap-2"
              >
                Volunteer dashboard
                <ArrowRight size={17} />
              </Link>
            )}

          </div>

          {match.status === "suggested" && (
            <div className="mt-6 flex items-center gap-2 border-t border-[#1d3028] pt-5 text-sm text-amber-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              Waiting for shelter confirmation
            </div>
          )}
        </motion.section>

        {/* WHY THIS MATCH */}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#39d98a]">
              Matching logic
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Why this shelter?
            </h2>

            <p className="mt-2 text-sm text-[#8d9b95]">
              The match is based on the information available for this
              donation and shelter.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">

            <div className="rw-card rw-card-hover flex items-start gap-4 p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#39d98a]/10 text-[#39d98a]">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-[#53615b]">
                  Shelter status
                </p>

                <p className="mt-1 text-sm text-[#dce4e0]">
                  Currently{" "}
                  <span className="font-semibold capitalize text-[#39d98a]">
                    {match.shelter.status}
                  </span>
                </p>
              </div>
            </div>

            <div className="rw-card rw-card-hover flex items-start gap-4 p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#39d98a]/10 text-[#39d98a]">
                <Package size={18} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-[#53615b]">
                  Capacity
                </p>

                <p className="mt-1 text-sm text-[#dce4e0]">
                  Shelter capacity is{" "}
                  <span className="font-semibold text-white">
                    {match.shelter.capacity_kg} kg
                  </span>
                </p>
              </div>
            </div>

            <div className="rw-card rw-card-hover flex items-start gap-4 p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#39d98a]/10 text-[#39d98a]">
                <Utensils size={18} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-[#53615b]">
                  Food compatibility
                </p>

                <p className="mt-1 text-sm text-[#dce4e0]">
                  Accepts{" "}
                  <span className="font-semibold capitalize text-white">
                    {donation.food_category}
                  </span>{" "}
                  food
                </p>
              </div>
            </div>

            <div className="rw-card rw-card-hover flex items-start gap-4 p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#39d98a]/10 text-[#39d98a]">
                <Route size={18} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-[#53615b]">
                  Distance
                </p>

                <p className="mt-1 text-sm text-[#dce4e0]">
                  Approximately{" "}
                  <span className="font-semibold text-white">
                    {match.distance_km} km
                  </span>{" "}
                  away
                </p>
              </div>
            </div>

          </div>
        </motion.section>

        {/* NEXT STEP */}

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 rounded-2xl border border-[#1d3028] bg-[#0d1915] p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#39d98a]/10 text-[#39d98a]">
                <Truck size={19} />
              </div>

              <div>
                <p className="font-semibold text-white">
                  What's next?
                </p>

                <p className="text-sm text-[#8d9b95]">
                  {match.status === "confirmed"
                    ? "A volunteer can now pick up the donation."
                    : "The shelter needs to confirm the rescue request."}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href="/dashboard"
                className="rw-button-secondary inline-flex items-center gap-2"
              >
                Dashboard
              </Link>

              <Link
                href="/donate"
                className="rw-button-primary inline-flex items-center gap-2"
              >
                New donation
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        </motion.section>

        {/* FOOTER */}

        <p className="mt-10 text-center text-xs text-[#53615b]">
          RescueWavy · Turning surplus food into someone's next meal.
        </p>

      </div>
    </main>
  );
}