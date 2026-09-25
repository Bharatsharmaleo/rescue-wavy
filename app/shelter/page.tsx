"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  Truck,
  Utensils,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type Donation = {
  id: string;
  food_description: string;
  food_category: string;
  quantity_kg: number;
  expiry_time: string;
  location: string;
  status: string;
  created_at: string;
};

type Match = {
  id: string;
  donation_id: string;
  shelter_id: string;
  score: number;
  distance_km: number;
  status: string;
};

export default function ShelterPage() {
  const supabase = createClient();

  const [shelter, setShelter] = useState<any>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadShelterData();
  }, []);

  async function loadShelterData() {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: shelterData, error: shelterError } =
        await supabase
          .from("shelters")
          .select("*")
          .eq("owner_id", user.id)
          .single();

      if (shelterError || !shelterData) {
        console.error("Shelter error:", shelterError);

        setMessage(
          "No shelter profile is connected to this account."
        );

        setLoading(false);
        return;
      }

      setShelter(shelterData);

      const { data: donationData, error: donationError } =
        await supabase
          .from("donations")
          .select("*")
          .in("status", [
            "available",
            "matched",
            "pickup_assigned",
          ])
          .order("created_at", {
            ascending: false,
          });

      if (donationError) {
        console.error(
          "Donation error:",
          donationError
        );
      }

      setDonations(donationData || []);

      const { data: matchData, error: matchError } =
        await supabase
          .from("matches")
          .select("*")
          .eq("shelter_id", shelterData.id)
          .in("status", [
            "suggested",
            "confirmed",
          ])
          .order("created_at", {
            ascending: false,
          });

      if (matchError) {
        console.error(
          "Match error:",
          matchError
        );
      }

      setMatches(matchData || []);
    } catch (error) {
      console.error(error);

      setMessage(
        "Something went wrong while loading the shelter dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  async function confirmRescue(match: Match) {
    setActionLoading(match.id);
    setMessage("");

    try {
      const { error: matchError } =
        await supabase
          .from("matches")
          .update({
            status: "confirmed",
          })
          .eq("id", match.id);

      if (matchError) {
        throw matchError;
      }

      const { error: pickupError } =
        await supabase
          .from("pickups")
          .insert({
            donation_id: match.donation_id,
            volunteer_id: null,
            status: "available",
          });

      if (pickupError) {
        console.error(
          "Pickup creation error:",
          pickupError
        );
      }

      const { error: donationError } =
        await supabase
          .from("donations")
          .update({
            status: "pickup_assigned",
          })
          .eq("id", match.donation_id);

      if (donationError) {
        throw donationError;
      }

      setMessage(
        "Rescue confirmed. The donation is now available for volunteer pickup."
      );

      await loadShelterData();
    } catch (error: any) {
      console.error(
        "CONFIRM ERROR:",
        error
      );

      setMessage(
        error?.message ||
          "Could not confirm the rescue."
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectRescue(match: Match) {
    setActionLoading(match.id);
    setMessage("");

    try {
      const { error } =
        await supabase
          .from("matches")
          .update({
            status: "rejected",
          })
          .eq("id", match.id);

      if (error) {
        throw error;
      }

      await supabase
        .from("donations")
        .update({
          status: "available",
        })
        .eq("id", match.donation_id);

      setMessage(
        "Rescue request rejected."
      );

      await loadShelterData();
    } catch (error: any) {
      console.error(error);

      setMessage(
        error?.message ||
          "Could not reject the rescue."
      );
    } finally {
      setActionLoading(null);
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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1d3028] bg-[#0d1915]">
            <ShieldCheck
              size={28}
              className="animate-pulse text-[#39d98a]"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-white">
            Loading shelter dashboard
          </h1>

          <p className="mt-2 text-sm text-[#8d9b95]">
            Checking incoming rescue requests...
          </p>
        </motion.div>
      </main>
    );
  }

  const pendingMatches = matches.filter(
    (match) => match.status === "suggested"
  );

  const confirmedMatches = matches.filter(
    (match) => match.status === "confirmed"
  );

  const totalFood = donations.reduce(
    (sum, donation) => sum + Number(donation.quantity_kg || 0),
    0
  );

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

          <button
            onClick={loadShelterData}
            className="inline-flex items-center gap-2 text-sm text-[#8d9b95] transition hover:text-white"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* HEADER */}

        <motion.header
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#39d98a]/20 bg-[#39d98a]/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#39d98a]">
            <ShieldCheck size={14} />
            Shelter network
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                {shelter?.name}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-[#8d9b95]">
                Review matched donations, confirm rescues and
                make surplus food available for volunteer pickup.
              </p>
            </div>

            <div className="rounded-2xl border border-[#39d98a]/20 bg-[#0d1915] px-6 py-5 lg:min-w-[180px]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#53615b]">
                Shelter capacity
              </p>

              <p className="mt-1 text-3xl font-black text-[#39d98a]">
                {shelter?.capacity_kg} kg
              </p>

              <p className="mt-1 text-xs text-[#53615b]">
                Registered capacity
              </p>
            </div>

          </div>
        </motion.header>

        {/* MESSAGE */}

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-2xl border border-[#1d3028] bg-[#0d1915] p-4"
          >
            {message.includes("confirmed") ? (
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0 text-[#39d98a]"
              />
            ) : (
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-amber-300"
              />
            )}

            <p className="text-sm leading-6 text-[#dce4e0]">
              {message}
            </p>
          </motion.div>
        )}

        {/* OVERVIEW */}

        <div className="mb-10 grid gap-4 sm:grid-cols-3">

          <div className="rw-card p-5">
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
              <Clock3 size={18} />
            </div>

            <p className="text-xs uppercase tracking-wider text-[#53615b]">
              Pending
            </p>

            <p className="mt-1 text-3xl font-black text-white">
              {pendingMatches.length}
            </p>
          </div>

          <div className="rw-card p-5">
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[#39d98a]/10 text-[#39d98a]">
              <CheckCircle2 size={18} />
            </div>

            <p className="text-xs uppercase tracking-wider text-[#53615b]">
              Confirmed
            </p>

            <p className="mt-1 text-3xl font-black text-white">
              {confirmedMatches.length}
            </p>
          </div>

          <div className="rw-card p-5">
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
              <Package size={18} />
            </div>

            <p className="text-xs uppercase tracking-wider text-[#53615b]">
              Food in view
            </p>

            <p className="mt-1 text-3xl font-black text-white">
              {totalFood} kg
            </p>
          </div>

        </div>

        {/* RESCUE REQUESTS */}

        <section className="mb-12">

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#39d98a]">
                Incoming
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Rescue requests
              </h2>

              <p className="mt-1 text-sm text-[#8d9b95]">
                Review matched donations waiting for your confirmation.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1.5 text-xs font-bold text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              {pendingMatches.length} pending
            </span>

          </div>

          {pendingMatches.length === 0 ? (
            <div className="rw-card p-10">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1d3028] bg-[#101f1a]">
                  <CheckCircle2
                    size={25}
                    className="text-[#53615b]"
                  />
                </div>

                <h3 className="mt-5 text-xl font-bold text-white">
                  No pending rescue requests
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#8d9b95]">
                  New matched donations will appear here when
                  they are routed to your shelter.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">

              {pendingMatches.map((match, index) => {
                const donation = donations.find(
                  (item) =>
                    item.id === match.donation_id
                );

                if (!donation) {
                  return null;
                }

                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.08,
                    }}
                    className="overflow-hidden rounded-[18px] border border-[#39d98a]/25 bg-[#0d1915]"
                  >

                    {/* CARD HEADER */}

                    <div className="border-b border-[#1d3028] bg-[#39d98a]/[0.025] px-6 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">

                        <div className="flex items-center gap-2">
                          <Clock3
                            size={16}
                            className="text-amber-300"
                          />

                          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                            Pending confirmation
                          </span>
                        </div>

                        <span className="text-xs text-[#53615b]">
                          Match #{match.score}
                        </span>

                      </div>
                    </div>

                    <div className="p-6">

                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#39d98a]/10 text-[#39d98a]">
                              <Package size={21} />
                            </div>

                            <div>
                              <p className="text-xs uppercase tracking-wider text-[#53615b]">
                                Incoming donation
                              </p>

                              <h3 className="mt-1 text-2xl font-bold leading-tight text-white">
                                {donation.food_description}
                              </h3>
                            </div>
                          </div>

                          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                            <div className="rounded-2xl border border-[#1d3028] bg-[#07100d] p-4">
                              <Utensils
                                size={16}
                                className="mb-3 text-[#39d98a]"
                              />

                              <p className="text-[11px] uppercase tracking-wider text-[#53615b]">
                                Category
                              </p>

                              <p className="mt-1 font-semibold capitalize text-white">
                                {donation.food_category}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-[#1d3028] bg-[#07100d] p-4">
                              <Package
                                size={16}
                                className="mb-3 text-[#39d98a]"
                              />

                              <p className="text-[11px] uppercase tracking-wider text-[#53615b]">
                                Quantity
                              </p>

                              <p className="mt-1 font-semibold text-white">
                                {donation.quantity_kg} kg
                              </p>
                            </div>

                            <div className="rounded-2xl border border-[#1d3028] bg-[#07100d] p-4">
                              <MapPin
                                size={16}
                                className="mb-3 text-[#39d98a]"
                              />

                              <p className="text-[11px] uppercase tracking-wider text-[#53615b]">
                                Pickup
                              </p>

                              <p className="mt-1 font-semibold leading-5 text-white">
                                {donation.location}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-[#1d3028] bg-[#07100d] p-4">
                              <ShieldCheck
                                size={16}
                                className="mb-3 text-[#39d98a]"
                              />

                              <p className="text-[11px] uppercase tracking-wider text-[#53615b]">
                                Match score
                              </p>

                              <p className="mt-1 font-black text-[#39d98a]">
                                {match.score}
                              </p>
                            </div>

                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="flex w-full flex-col gap-3 lg:w-[190px]">

                          <button
                            onClick={() =>
                              confirmRescue(match)
                            }
                            disabled={
                              actionLoading ===
                              match.id
                            }
                            className="rw-button-primary inline-flex w-full items-center justify-center gap-2"
                          >
                            {actionLoading ===
                            match.id ? (
                              <>
                                <RefreshCw
                                  size={17}
                                  className="animate-spin"
                                />
                                Confirming...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={17} />
                                Confirm rescue
                              </>
                            )}
                          </button>

                          <button
                            onClick={() =>
                              rejectRescue(match)
                            }
                            disabled={
                              actionLoading ===
                              match.id
                            }
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-3.5 text-sm font-bold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <XCircle size={17} />
                            Reject
                          </button>

                        </div>

                      </div>

                      <div className="mt-6 flex items-center gap-2 border-t border-[#1d3028] pt-5 text-xs text-[#53615b]">
                        <Truck size={14} />
                        Confirming this request creates a pickup
                        request for volunteers.
                      </div>

                    </div>
                  </motion.div>
                );
              })}

            </div>
          )}
        </section>

        {/* AVAILABLE FOOD */}

        <section>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#39d98a]">
              Food pipeline
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Available food
            </h2>

            <p className="mt-1 text-sm text-[#8d9b95]">
              Donations currently visible to your shelter.
            </p>
          </div>

          {donations.length === 0 ? (
            <div className="rw-card p-10 text-center">
              <Package
                size={30}
                className="mx-auto text-[#53615b]"
              />

              <p className="mt-4 text-sm text-[#8d9b95]">
                No food donations are currently available.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {donations.map((donation, index) => {
                const relatedMatch = matches.find(
                  (match) =>
                    match.donation_id ===
                    donation.id
                );

                return (
                  <motion.div
                    key={donation.id}
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    className="rw-card rw-card-hover p-5"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#39d98a]/10 text-[#39d98a]">
                          <Package size={18} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold leading-6 text-white">
                            {donation.food_description}
                          </h3>

                          <p className="mt-1 flex items-center gap-1 text-xs text-[#53615b]">
                            <MapPin size={12} />
                            {donation.location}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-lg font-black text-[#39d98a]">
                        {donation.quantity_kg} kg
                      </span>

                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">

                      <span className="rounded-full border border-[#1d3028] bg-[#07100d] px-3 py-1 text-xs capitalize text-[#8d9b95]">
                        {donation.food_category}
                      </span>

                      <span className="rounded-full border border-[#1d3028] bg-[#07100d] px-3 py-1 text-xs capitalize text-[#8d9b95]">
                        {donation.status.replace(
                          "_",
                          " "
                        )}
                      </span>

                      {relatedMatch && (
                        <span className="rounded-full border border-[#39d98a]/20 bg-[#39d98a]/5 px-3 py-1 text-xs capitalize text-[#39d98a]">
                          Match:{" "}
                          {relatedMatch.status}
                        </span>
                      )}

                    </div>

                  </motion.div>
                );
              })}

            </div>
          )}

        </section>

        {/* FOOTER */}

        <div className="mt-12 border-t border-[#1d3028] pt-6 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[#8d9b95] transition hover:text-white"
          >
            Back to dashboard
            <ArrowRight size={15} />
          </Link>

          <p className="mt-4 text-xs text-[#53615b]">
            RescueWavy · Giving surplus food a second destination.
          </p>
        </div>

      </div>
    </main>
  );
}