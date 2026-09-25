"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  RefreshCw,
  Truck,
  Warehouse,
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type Pickup = {
  id: string;
  donation_id: string;
  volunteer_id: string | null;
  status: string;
  created_at: string;
};

type Donation = {
  id: string;
  food_description: string;
  food_category: string;
  quantity_kg: number;
  location: string;
  status: string;
};

type Shelter = {
  id: string;
  name: string;
  address: string;
};

type PickupCard = {
  pickup: Pickup;
  donation: Donation;
  shelter: Shelter | null;
};

export default function VolunteerPage() {
  const [availablePickups, setAvailablePickups] = useState<PickupCard[]>([]);
  const [myPickups, setMyPickups] = useState<PickupCard[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPickups();
  }, []);

  async function getPickupCards(
    pickupData: Pickup[],
    supabase: ReturnType<typeof createClient>
  ) {
    const cards: PickupCard[] = [];

    for (const pickup of pickupData) {
      const { data: donationData, error: donationError } =
        await supabase
          .from("donations")
          .select("*")
          .eq("id", pickup.donation_id)
          .single();

      if (donationError || !donationData) {
        continue;
      }

      const { data: matchData } = await supabase
        .from("matches")
        .select("shelter_id")
        .eq("donation_id", pickup.donation_id)
        .eq("status", "confirmed")
        .limit(1)
        .maybeSingle();

      let shelterData: Shelter | null = null;

      if (matchData) {
        const { data: shelter } = await supabase
          .from("shelters")
          .select("id, name, address")
          .eq("id", matchData.shelter_id)
          .single();

        shelterData = shelter;
      }

      cards.push({
        pickup,
        donation: donationData,
        shelter: shelterData,
      });
    }

    return cards;
  }

  async function loadPickups() {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: availableData, error: availableError } =
        await supabase
          .from("pickups")
          .select("*")
          .eq("status", "available")
          .is("volunteer_id", null)
          .order("created_at", {
            ascending: false,
          });

      if (availableError) {
        throw availableError;
      }

      const { data: myData, error: myError } =
        await supabase
          .from("pickups")
          .select("*")
          .eq("volunteer_id", user.id)
          .in("status", ["accepted", "picked_up"])
          .order("created_at", {
            ascending: false,
          });

      if (myError) {
        throw myError;
      }

      const availableCards = await getPickupCards(
        availableData || [],
        supabase
      );

      const myCards = await getPickupCards(
        myData || [],
        supabase
      );

      setAvailablePickups(availableCards);
      setMyPickups(myCards);
    } catch (err: any) {
      console.error(err);

      setError(
        err.message || "Could not load pickup requests."
      );
    } finally {
      setLoading(false);
    }
  }

  async function acceptPickup(pickupId: string) {
    setActionLoading(pickupId);
    setError("");

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { error } = await supabase
        .from("pickups")
        .update({
          volunteer_id: user.id,
          status: "accepted",
        })
        .eq("id", pickupId)
        .eq("status", "available")
        .is("volunteer_id", null);

      if (error) {
        throw error;
      }

      await loadPickups();
    } catch (err: any) {
      console.error(err);

      setError(
        err.message || "Could not accept pickup."
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function markPickedUp(pickupId: string) {
    setActionLoading(pickupId);
    setError("");

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { error: pickupError } = await supabase
        .from("pickups")
        .update({
          status: "picked_up",
          pickup_time: new Date().toISOString(),
        })
        .eq("id", pickupId)
        .eq("volunteer_id", user.id)
        .eq("status", "accepted");

      if (pickupError) {
        throw pickupError;
      }

      const pickup = myPickups.find(
        (item) => item.pickup.id === pickupId
      );

      if (pickup) {
        const { error: donationError } = await supabase
          .from("donations")
          .update({
            status: "picked_up",
          })
          .eq("id", pickup.donation.id);

        if (donationError) {
          throw donationError;
        }
      }

      await loadPickups();
    } catch (err: any) {
      console.error(err);

      setError(
        err.message || "Could not mark food as picked up."
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function markDelivered(pickupId: string) {
    setActionLoading(pickupId);
    setError("");

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { error: pickupError } = await supabase
        .from("pickups")
        .update({
          status: "delivered",
          delivery_time: new Date().toISOString(),
        })
        .eq("id", pickupId)
        .eq("volunteer_id", user.id)
        .eq("status", "picked_up");

      if (pickupError) {
        throw pickupError;
      }

      const pickup = myPickups.find(
        (item) => item.pickup.id === pickupId
      );

      if (pickup) {
        const { error: donationError } = await supabase
          .from("donations")
          .update({
            status: "delivered",
          })
          .eq("id", pickup.donation.id);

        if (donationError) {
          throw donationError;
        }
      }

      await loadPickups();
    } catch (err: any) {
      console.error(err);

      setError(
        err.message || "Could not mark food as delivered."
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
            <Truck
              size={28}
              className="animate-pulse text-[#39d98a]"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-white">
            Loading pickup network
          </h1>

          <p className="mt-2 text-sm text-[#8d9b95]">
            Finding available and assigned rescues...
          </p>
        </motion.div>
      </main>
    );
  }

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
            onClick={loadPickups}
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
            <Truck size={14} />
            Volunteer network
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
            Move food where it matters.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-[#8d9b95]">
            Pick up surplus food from donors and help deliver it
            to the shelter waiting for it.
          </p>
        </motion.header>

        {/* ERROR */}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300"
          >
            <Clock3
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>{error}</p>
          </motion.div>
        )}

        {/* STATS */}

        <div className="mb-10 grid gap-4 sm:grid-cols-3">

          <div className="rw-card p-5">
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[#39d98a]/10 text-[#39d98a]">
              <Truck size={18} />
            </div>

            <p className="text-xs uppercase tracking-wider text-[#53615b]">
              My active
            </p>

            <p className="mt-1 text-3xl font-black text-white">
              {myPickups.length}
            </p>
          </div>

          <div className="rw-card p-5">
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
              <Package size={18} />
            </div>

            <p className="text-xs uppercase tracking-wider text-[#53615b]">
              Available
            </p>

            <p className="mt-1 text-3xl font-black text-white">
              {availablePickups.length}
            </p>
          </div>

          <div className="rw-card p-5">
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
              <CheckCircle2 size={18} />
            </div>

            <p className="text-xs uppercase tracking-wider text-[#53615b]">
              Current mode
            </p>

            <p className="mt-1 text-lg font-bold capitalize text-white">
              {myPickups.length > 0
                ? "On a rescue"
                : "Ready to help"}
            </p>
          </div>

        </div>

        {/* ACTIVE PICKUPS */}

        <section className="mb-12">

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#39d98a]">
              Your route
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              My active pickup
            </h2>

            <p className="mt-1 text-sm text-[#8d9b95]">
              Pickups currently assigned to you.
            </p>
          </div>

          {myPickups.length === 0 ? (
            <div className="rw-card p-8 md:p-10">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1d3028] bg-[#101f1a]">
                  <Truck
                    size={25}
                    className="text-[#53615b]"
                  />
                </div>

                <h3 className="mt-5 text-xl font-bold text-white">
                  No active pickup
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#8d9b95]">
                  Accept an available pickup below and it will
                  appear here as your current rescue.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {myPickups.map(
                ({ pickup, donation, shelter }, index) => (
                  <motion.div
                    key={pickup.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="overflow-hidden rounded-[18px] border border-[#39d98a]/25 bg-[#0d1915]"
                  >
                    {/* STATUS */}

                    <div className="border-b border-[#1d3028] px-6 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">

                        <div className="flex items-center gap-2">
                          {pickup.status === "accepted" ? (
                            <Clock3
                              size={16}
                              className="text-amber-300"
                            />
                          ) : (
                            <CheckCircle2
                              size={16}
                              className="text-[#39d98a]"
                            />
                          )}

                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${
                              pickup.status === "accepted"
                                ? "text-amber-300"
                                : "text-[#39d98a]"
                            }`}
                          >
                            {pickup.status === "accepted"
                              ? "Pickup accepted"
                              : "Food picked up"}
                          </span>
                        </div>

                        <span className="text-xs text-[#53615b]">
                          Active rescue
                        </span>
                      </div>
                    </div>

                    <div className="p-6">

                      <h3 className="text-2xl font-bold leading-tight text-white">
                        {donation.food_description}
                      </h3>

                      <div className="mt-6 grid gap-3 md:grid-cols-3">

                        <div className="rounded-2xl border border-[#1d3028] bg-[#07100d] p-4">
                          <Package
                            size={17}
                            className="mb-3 text-[#39d98a]"
                          />

                          <p className="text-[11px] uppercase tracking-wider text-[#53615b]">
                            Quantity
                          </p>

                          <p className="mt-1 font-bold text-white">
                            {donation.quantity_kg} kg
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#1d3028] bg-[#07100d] p-4">
                          <MapPin
                            size={17}
                            className="mb-3 text-[#39d98a]"
                          />

                          <p className="text-[11px] uppercase tracking-wider text-[#53615b]">
                            Pickup from
                          </p>

                          <p className="mt-1 font-semibold leading-5 text-white">
                            {donation.location}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#1d3028] bg-[#07100d] p-4">
                          <Warehouse
                            size={17}
                            className="mb-3 text-[#39d98a]"
                          />

                          <p className="text-[11px] uppercase tracking-wider text-[#53615b]">
                            Deliver to
                          </p>

                          <p className="mt-1 font-semibold leading-5 text-white">
                            {shelter
                              ? shelter.name
                              : "Matched Shelter"}
                          </p>

                          {shelter && (
                            <p className="mt-1 text-xs leading-5 text-[#53615b]">
                              {shelter.address}
                            </p>
                          )}
                        </div>

                      </div>

                      {/* PROGRESS */}

                      <div className="mt-6 rounded-2xl border border-[#1d3028] bg-[#07100d] p-5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#8d9b95]">
                            Rescue progress
                          </span>

                          <span className="font-semibold text-[#39d98a]">
                            {pickup.status === "accepted"
                              ? "1 / 2"
                              : "2 / 2"}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-[#39d98a]" />

                          <div
                            className={`h-2 flex-1 rounded-full ${
                              pickup.status === "picked_up"
                                ? "bg-[#39d98a]"
                                : "bg-[#1d3028]"
                            }`}
                          />
                        </div>

                        <div className="mt-3 flex justify-between text-[11px] text-[#53615b]">
                          <span>Pickup</span>
                          <span>Delivery</span>
                        </div>
                      </div>

                      {/* ACTION */}

                      {pickup.status === "accepted" ? (
                        <button
                          onClick={() =>
                            markPickedUp(pickup.id)
                          }
                          disabled={
                            actionLoading === pickup.id
                          }
                          className="rw-button-primary mt-5 inline-flex w-full items-center justify-center gap-2"
                        >
                          {actionLoading === pickup.id ? (
                            <>
                              <RefreshCw
                                size={17}
                                className="animate-spin"
                              />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Package size={17} />
                              Mark food as picked up
                              <ArrowRight size={17} />
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            markDelivered(pickup.id)
                          }
                          disabled={
                            actionLoading === pickup.id
                          }
                          className="rw-button-primary mt-5 inline-flex w-full items-center justify-center gap-2"
                        >
                          {actionLoading === pickup.id ? (
                            <>
                              <RefreshCw
                                size={17}
                                className="animate-spin"
                              />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Warehouse size={17} />
                              Mark food as delivered
                              <CheckCircle2 size={17} />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              )}
            </div>
          )}
        </section>

        {/* AVAILABLE PICKUPS */}

        <section>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#39d98a]">
              Open rescues
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Available pickups
            </h2>

            <p className="mt-1 text-sm text-[#8d9b95]">
              Choose a rescue request you can help deliver.
            </p>
          </div>

          {availablePickups.length === 0 ? (
            <div className="rw-card p-8 md:p-10">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1d3028] bg-[#101f1a]">
                  <CheckCircle2
                    size={25}
                    className="text-[#39d98a]"
                  />
                </div>

                <h3 className="mt-5 text-xl font-bold text-white">
                  No pickups available
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#8d9b95]">
                  New confirmed rescue requests will appear here
                  automatically.
                </p>

                <button
                  onClick={loadPickups}
                  className="rw-button-secondary mt-6 inline-flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh pickups
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-5">

              {availablePickups.map(
                ({ pickup, donation, shelter }, index) => (
                  <motion.div
                    key={pickup.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="rw-card rw-card-hover p-6"
                  >

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                        Available
                      </span>

                      <span className="text-xs text-[#53615b]">
                        Rescue request
                      </span>
                    </div>

                    <h3 className="mt-5 text-2xl font-bold text-white">
                      {donation.food_description}
                    </h3>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">

                      <div className="rounded-2xl border border-[#1d3028] bg-[#07100d] p-4">
                        <Package
                          size={17}
                          className="mb-3 text-[#39d98a]"
                        />

                        <p className="text-[11px] uppercase tracking-wider text-[#53615b]">
                          Quantity
                        </p>

                        <p className="mt-1 font-bold text-white">
                          {donation.quantity_kg} kg
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#1d3028] bg-[#07100d] p-4">
                        <MapPin
                          size={17}
                          className="mb-3 text-[#39d98a]"
                        />

                        <p className="text-[11px] uppercase tracking-wider text-[#53615b]">
                          Pickup from
                        </p>

                        <p className="mt-1 font-semibold leading-5 text-white">
                          {donation.location}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#1d3028] bg-[#07100d] p-4">
                        <Warehouse
                          size={17}
                          className="mb-3 text-[#39d98a]"
                        />

                        <p className="text-[11px] uppercase tracking-wider text-[#53615b]">
                          Deliver to
                        </p>

                        <p className="mt-1 font-semibold leading-5 text-white">
                          {shelter
                            ? shelter.name
                            : "Matched Shelter"}
                        </p>

                        {shelter && (
                          <p className="mt-1 text-xs leading-5 text-[#53615b]">
                            {shelter.address}
                          </p>
                        )}
                      </div>

                    </div>

                    <button
                      onClick={() =>
                        acceptPickup(pickup.id)
                      }
                      disabled={
                        actionLoading === pickup.id
                      }
                      className="rw-button-primary mt-5 inline-flex w-full items-center justify-center gap-2"
                    >
                      {actionLoading === pickup.id ? (
                        <>
                          <RefreshCw
                            size={17}
                            className="animate-spin"
                          />
                          Accepting...
                        </>
                      ) : (
                        <>
                          Accept pickup
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>

                  </motion.div>
                )
              )}

            </div>
          )}
        </section>

        {/* FOOTER */}

        <p className="mt-10 text-center text-xs text-[#53615b]">
          RescueWavy · Every pickup moves surplus food one step
          closer to someone who needs it.
        </p>

      </div>
    </main>
  );
}