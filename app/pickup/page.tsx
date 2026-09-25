"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Donation = {
  id: string;
  food_description: string;
  quantity_kg: number;
  food_category: string;
  location: string;
  status: string;
};

type Shelter = {
  id: string;
  name: string;
  address: string;
};

type Match = {
  id: string;
  donation_id: string;
  shelter_id: string;
  score: number;
  distance_km: number;
  status: string;
};

type Pickup = {
  id: string;
  donation_id: string;
  volunteer_id: string | null;
  status: string;
  pickup_time: string | null;
  delivery_time: string | null;
};

export default function PickupPage() {
  const [donation, setDonation] = useState<Donation | null>(null);
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [pickup, setPickup] = useState<Pickup | null>(null);

  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPickupData();
  }, []);

  async function loadPickupData() {
    setLoading(true);
    setError("");

    try {
      const matchId = localStorage.getItem("currentMatchId");

      if (!matchId) {
        setError(
          "No confirmed shelter match found. Please complete matching first."
        );
        setLoading(false);
        return;
      }

      const supabase = createClient();

      // GET MATCH
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (matchError) {
        throw matchError;
      }

      setMatch(matchData);

      // GET DONATION
      const { data: donationData, error: donationError } =
        await supabase
          .from("donations")
          .select("*")
          .eq("id", matchData.donation_id)
          .single();

      if (donationError) {
        throw donationError;
      }

      setDonation(donationData);

      // GET SHELTER
      const { data: shelterData, error: shelterError } =
        await supabase
          .from("shelters")
          .select("*")
          .eq("id", matchData.shelter_id)
          .single();

      if (shelterError) {
        throw shelterError;
      }

      setShelter(shelterData);

      // GET EXISTING PICKUP
      const { data: pickupData, error: pickupError } = await supabase
        .from("pickups")
        .select("*")
        .eq("donation_id", donationData.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pickupError) {
        throw pickupError;
      }

      setPickup(pickupData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not load pickup details.");
    } finally {
      setLoading(false);
    }
  }

  async function requestPickup() {
    if (!donation) return;

    setRequesting(true);
    setError("");

    try {
      const supabase = createClient();

      // Check if a pickup already exists
      const { data: existingPickup, error: existingError } =
        await supabase
          .from("pickups")
          .select("*")
          .eq("donation_id", donation.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingPickup) {
        setPickup(existingPickup);
        setError("A pickup request already exists for this donation.");
        return;
      }

      // CREATE PICKUP REQUEST
      const { data: pickupData, error: pickupError } = await supabase
        .from("pickups")
        .insert({
          donation_id: donation.id,
          volunteer_id: null,
          status: "available",
        })
        .select()
        .single();

      if (pickupError) {
        throw pickupError;
      }

      // UPDATE DONATION STATUS
      const { error: donationError } = await supabase
        .from("donations")
        .update({
          status: "pickup_assigned",
        })
        .eq("id", donation.id);

      if (donationError) {
        throw donationError;
      }

      setPickup(pickupData);

      setDonation({
        ...donation,
        status: "pickup_assigned",
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not request pickup.");
    } finally {
      setRequesting(false);
    }
  }

  function getStatusStep() {
    if (!donation) return 1;

    if (donation.status === "delivered") {
      return 4;
    }

    if (donation.status === "picked_up") {
      return 3;
    }

    if (
      donation.status === "pickup_assigned" ||
      pickup?.status === "accepted"
    ) {
      return 2;
    }

    if (donation.status === "matched") {
      return 1;
    }

    return 1;
  }

  const currentStep = getStatusStep();

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="text-5xl">🚚</div>

          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            Loading rescue mission...
          </h1>

          <p className="mt-3 text-slate-600">
            Getting your donation, shelter and pickup information.
          </p>
        </section>
      </main>
    );
  }

  if (error && !donation) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="text-5xl">⚠️</div>

          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            Pickup information unavailable
          </h1>

          <p className="mt-3 text-slate-600">
            {error}
          </p>

          <Link
            href="/match"
            className="mt-8 inline-block rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
          >
            Back to Matching →
          </Link>
        </section>
      </main>
    );
  }

  if (!donation || !shelter || !match) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-xl">
              ♻️
            </div>

            <span className="text-2xl font-bold text-slate-900">
              RescueWavy
            </span>
          </Link>

          <Link
            href="/match"
            className="text-sm font-semibold text-slate-600 hover:text-green-600"
          >
            ← Back to Matching
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        {/* TITLE */}

        <div className="mb-10 text-center">
          <p className="mb-3 inline-block rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
            🚚 RESCUE MISSION
          </p>

          <h1 className="text-4xl font-bold text-slate-900">
            Food Rescue Coordination
          </h1>

          <p className="mt-3 text-lg text-slate-600">
            Your donation is on its way to someone who needs it.
          </p>
        </div>

        {/* STATUS TIMELINE */}

        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              RESCUE STATUS
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Mission Progress
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {/* STEP 1 */}

            <div
              className={`rounded-2xl p-5 ${
                currentStep >= 1
                  ? "bg-green-50 ring-1 ring-green-200"
                  : "bg-slate-50"
              }`}
            >
              <div className="text-3xl">🍱</div>

              <p className="mt-3 text-sm font-semibold text-slate-500">
                STEP 1
              </p>

              <h3 className="mt-1 font-bold text-slate-900">
                Donation
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                Food registered
              </p>
            </div>

            {/* STEP 2 */}

            <div
              className={`rounded-2xl p-5 ${
                currentStep >= 2
                  ? "bg-green-50 ring-1 ring-green-200"
                  : "bg-slate-50"
              }`}
            >
              <div className="text-3xl">🧠</div>

              <p className="mt-3 text-sm font-semibold text-slate-500">
                STEP 2
              </p>

              <h3 className="mt-1 font-bold text-slate-900">
                Matched
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                Shelter selected
              </p>
            </div>

            {/* STEP 3 */}

            <div
              className={`rounded-2xl p-5 ${
                currentStep >= 3
                  ? "bg-green-50 ring-1 ring-green-200"
                  : "bg-slate-50"
              }`}
            >
              <div className="text-3xl">🚚</div>

              <p className="mt-3 text-sm font-semibold text-slate-500">
                STEP 3
              </p>

              <h3 className="mt-1 font-bold text-slate-900">
                Pickup
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                Volunteer collects food
              </p>
            </div>

            {/* STEP 4 */}

            <div
              className={`rounded-2xl p-5 ${
                currentStep >= 4
                  ? "bg-green-50 ring-1 ring-green-200"
                  : "bg-slate-50"
              }`}
            >
              <div className="text-3xl">🏠</div>

              <p className="mt-3 text-sm font-semibold text-slate-500">
                STEP 4
              </p>

              <h3 className="mt-1 font-bold text-slate-900">
                Delivered
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                Food reaches shelter
              </p>
            </div>
          </div>
        </div>

        {/* MAIN CARD */}

        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          {/* DONATION DETAILS */}

          <div className="mb-8">
            <p className="text-sm font-semibold text-slate-500">
              DONATION DETAILS
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Food Donation
            </h2>

            <p className="mt-2 text-slate-600">
              {donation.food_description}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Quantity
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {donation.quantity_kg} kg
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Food Type
              </p>

              <p className="mt-2 text-xl font-bold capitalize text-slate-900">
                {donation.food_category}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Pickup Location
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {donation.location}
              </p>
            </div>
          </div>

          {/* MATCHED SHELTER */}

          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              🏠 Matched Shelter
            </p>

            <h2 className="mt-2 text-2xl font-bold text-green-900">
              {shelter.name}
            </h2>

            <p className="mt-2 text-green-700">
              📍 {shelter.address}
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white p-4">
                <p className="text-sm text-slate-500">
                  Matching Score
                </p>

                <p className="mt-1 text-2xl font-bold text-green-700">
                  {match.score}/100
                </p>
              </div>

              <div className="rounded-xl bg-white p-4">
                <p className="text-sm text-slate-500">
                  Distance
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {match.distance_km} km
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-green-700">
              This shelter was selected using the RescueWavy smart
              matching system.
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* PICKUP ACTION */}

          {!pickup ? (
            <div className="mt-8">
              <button
                onClick={requestPickup}
                disabled={requesting}
                className="w-full rounded-xl bg-green-600 px-6 py-4 text-lg font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {requesting
                  ? "Creating Rescue Request..."
                  : "🚚 Request Volunteer Pickup →"}
              </button>

              <p className="mt-3 text-center text-sm text-slate-500">
                A volunteer will be able to see and accept this pickup
                request.
              </p>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-green-50 p-6">
              <div className="text-center">
                <div className="text-5xl">
                  {pickup.status === "delivered"
                    ? "🎉"
                    : pickup.status === "picked_up"
                    ? "🚚"
                    : pickup.status === "accepted"
                    ? "🙋"
                    : "⏳"}
                </div>

                <h2 className="mt-3 text-2xl font-bold text-green-900">
                  {pickup.status === "delivered"
                    ? "Food Delivered!"
                    : pickup.status === "picked_up"
                    ? "Food Picked Up!"
                    : pickup.status === "accepted"
                    ? "Volunteer Assigned!"
                    : "Pickup Request Created!"}
                </h2>

                <p className="mt-2 text-green-700">
                  {pickup.status === "delivered"
                    ? "Your donation has reached the matched shelter."
                    : pickup.status === "picked_up"
                    ? "The volunteer has collected the food."
                    : pickup.status === "accepted"
                    ? "A volunteer has accepted your rescue mission."
                    : "Your donation is now visible to available volunteers."}
                </p>
              </div>

              <div className="mt-6 rounded-xl bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      CURRENT STATUS
                    </p>

                    <p className="mt-1 text-lg font-bold capitalize text-green-700">
                      {pickup.status.replace("_", " ")}
                    </p>
                  </div>

                  <div className="text-3xl">
                    {pickup.status === "available"
                      ? "🟡"
                      : pickup.status === "accepted"
                      ? "🔵"
                      : pickup.status === "picked_up"
                      ? "🟠"
                      : pickup.status === "delivered"
                      ? "🟢"
                      : "⚪"}
                  </div>
                </div>
              </div>

              {pickup.status === "available" && (
                <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <p className="font-semibold text-yellow-900">
                    ⏳ Waiting for a volunteer
                  </p>

                  <p className="mt-1 text-sm text-yellow-700">
                    Your pickup request is now available on the volunteer
                    dashboard.
                  </p>
                </div>
              )}

              {pickup.status === "accepted" && (
                <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="font-semibold text-blue-900">
                    🙋 Volunteer assigned
                  </p>

                  <p className="mt-1 text-sm text-blue-700">
                    A volunteer has accepted this rescue mission and can
                    now collect the food.
                  </p>
                </div>
              )}

              {pickup.status === "picked_up" && (
                <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <p className="font-semibold text-orange-900">
                    🚚 Food is on the way
                  </p>

                  <p className="mt-1 text-sm text-orange-700">
                    The donation has been picked up and is being taken
                    toward the matched shelter.
                  </p>
                </div>
              )}

              {pickup.status === "delivered" && (
                <div className="mt-5 rounded-xl border border-green-200 bg-green-100 p-4">
                  <p className="font-semibold text-green-900">
                    🎉 Rescue completed
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    This donation has successfully completed its rescue
                    journey.
                  </p>
                </div>
              )}

              <Link
                href="/volunteer"
                className="mt-6 block w-full rounded-xl border border-slate-300 bg-white px-6 py-3 text-center font-bold text-slate-700 hover:bg-slate-50"
              >
                Open Volunteer Dashboard →
              </Link>
            </div>
          )}
        </div>

        {/* DEMO FLOW */}

        <div className="mt-8 rounded-3xl bg-slate-900 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-400">
            RESCUEWAVY FLOW
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            From surplus to shelter
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div>
              <div className="text-3xl">🍱</div>
              <p className="mt-2 font-semibold">1. Donate</p>
              <p className="mt-1 text-sm text-slate-400">
                Surplus food is registered.
              </p>
            </div>

            <div>
              <div className="text-3xl">🧠</div>
              <p className="mt-2 font-semibold">2. Match</p>
              <p className="mt-1 text-sm text-slate-400">
                The system finds a suitable shelter.
              </p>
            </div>

            <div>
              <div className="text-3xl">🚚</div>
              <p className="mt-2 font-semibold">3. Rescue</p>
              <p className="mt-1 text-sm text-slate-400">
                A volunteer collects the food.
              </p>
            </div>

            <div>
              <div className="text-3xl">🏠</div>
              <p className="mt-2 font-semibold">4. Deliver</p>
              <p className="mt-1 text-sm text-slate-400">
                Food reaches the shelter.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}