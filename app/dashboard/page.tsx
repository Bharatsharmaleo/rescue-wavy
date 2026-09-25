"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  Home,
  LogOut,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Truck,
  Utensils,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  name: string;
  email: string;
  role: string;
};

type Donation = {
  id: string;
  quantity_kg: number;
  status: string;
  food_category: string;
  created_at: string;
};

type Pickup = {
  id: string;
  donation_id: string;
  status: string;
  created_at: string;
};

const chartColors = [
  "#39d98a",
  "#7dd3fc",
  "#fbbf24",
  "#c4b5fd",
  "#fb7185",
];

export default function DashboardPage() {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [donations, setDonations] =
    useState<Donation[]>([]);

  const [pickups, setPickups] =
    useState<Pickup[]>([]);

  const [totalFood, setTotalFood] = useState(0);
  const [completedDeliveries, setCompletedDeliveries] =
    useState(0);
  const [activePickups, setActivePickups] =
    useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      // PROFILE

      const { data: profileData } =
        await supabase
          .from("profiles")
          .select("name, email, role")
          .eq("id", user.id)
          .single();

      if (profileData) {
        setProfile(profileData);
      }

      // DONATIONS

      const {
        data: donationData,
        error: donationError,
      } = await supabase
        .from("donations")
        .select(
          "id, quantity_kg, status, food_category, created_at"
        )
        .order("created_at", {
          ascending: false,
        });

      if (donationError) {
        throw donationError;
      }

      const donationList = donationData || [];

      setDonations(donationList);

      // FOOD ACTUALLY RESCUED

      const rescuedFood = donationList
        .filter(
          (donation) =>
            donation.status === "delivered"
        )
        .reduce(
          (total, donation) =>
            total +
            Number(donation.quantity_kg),
          0
        );

      setTotalFood(rescuedFood);

      // PICKUPS

      const {
        data: pickupData,
        error: pickupError,
      } = await supabase
        .from("pickups")
        .select(
          "id, donation_id, status, created_at"
        )
        .order("created_at", {
          ascending: false,
        });

      if (pickupError) {
        throw pickupError;
      }

      const pickupList = pickupData || [];

      setPickups(pickupList);

      setCompletedDeliveries(
        pickupList.filter(
          (pickup) =>
            pickup.status === "delivered"
        ).length
      );

      setActivePickups(
        pickupList.filter(
          (pickup) =>
            pickup.status === "available" ||
            pickup.status === "accepted" ||
            pickup.status === "picked_up"
        ).length
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    window.location.href = "/login";
  }

  /*
   * --------------------------------
   * CHART DATA
   * --------------------------------
   */

  const dailyFoodData = useMemo(() => {
    const map: Record<string, number> = {};

    donations.forEach((donation) => {
      if (donation.status !== "delivered") {
        return;
      }

      const date = new Date(
        donation.created_at
      );

      const key =
        date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        });

      map[key] =
        (map[key] || 0) +
        Number(donation.quantity_kg);
    });

    return Object.entries(map)
      .reverse()
      .slice(-7)
      .map(([date, food]) => ({
        date,
        food: Number(food.toFixed(1)),
      }));
  }, [donations]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};

    donations.forEach((donation) => {
      if (donation.status !== "delivered") {
        return;
      }

      const category =
        donation.food_category || "other";

      map[category] =
        (map[category] || 0) +
        Number(donation.quantity_kg);
    });

    return Object.entries(map).map(
      ([name, value]) => ({
        name:
          name.charAt(0).toUpperCase() +
          name.slice(1),
        value: Number(value.toFixed(1)),
      })
    );
  }, [donations]);

  const statusData = useMemo(() => {
    const statuses = [
      "available",
      "matched",
      "pickup_assigned",
      "picked_up",
      "delivered",
    ];

    return statuses.map((status) => ({
      name:
        status === "pickup_assigned"
          ? "Pickup"
          : status
              .replace("_", " ")
              .replace(
                /\b\w/g,
                (letter) =>
                  letter.toUpperCase()
              ),

      count: donations.filter(
        (donation) =>
          donation.status === status
      ).length,
    }));
  }, [donations]);

  const estimatedMeals = Math.round(
    totalFood * 2
  );

  const rescueSuccess =
    donations.length > 0
      ? Math.round(
          (completedDeliveries /
            donations.length) *
            100
        )
      : 0;

  if (loading) {
    return (
      <main className="rw-page flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1d3028] bg-[#0d1915]">
            <RefreshCw
              size={28}
              className="animate-spin text-[#39d98a]"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-white">
            Loading RescueWavy
          </h1>

          <p className="mt-2 text-sm text-[#8d9b95]">
            Preparing your impact dashboard...
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="rw-page min-h-screen pb-16">

      {/* NAVBAR */}

      <header className="border-b border-[#1d3028] bg-[#07100d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#39d98a] text-[#07100d]">
              <HeartHandshake size={21} />
            </div>

            <div>
              <span className="text-lg font-black tracking-tight text-white">
                RescueWavy
              </span>

              <p className="hidden text-[10px] uppercase tracking-[0.16em] text-[#53615b] sm:block">
                Food rescue network
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">

            <Link
              href="/"
              className="hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#8d9b95] transition hover:bg-[#101f1a] hover:text-white md:flex"
            >
              <Home size={16} />
              Home
            </Link>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-[#1d3028] bg-[#0d1915] px-4 py-2.5 text-sm font-semibold text-[#dce4e0] transition hover:border-red-400/30 hover:bg-red-400/5 hover:text-red-300"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">
                Logout
              </span>
            </button>

          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pt-10 md:px-8 md:pt-14">

        {/* HERO */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-10"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#39d98a]/20 bg-[#39d98a]/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#39d98a]">
                <Activity size={14} />
                Impact center
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                Welcome
                {profile?.name
                  ? `, ${profile.name}`
                  : ""}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-[#8d9b95]">
                A live view of your food rescue
                activity, volunteer operations and
                community impact.
              </p>
            </div>

            <button
              onClick={loadDashboard}
              className="rw-button-secondary inline-flex w-fit items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh data
            </button>

          </div>
        </motion.div>

        {/* STATS */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rw-card rw-card-hover p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#39d98a]/10 text-[#39d98a]">
                <Utensils size={19} />
              </div>

              <span className="rounded-full bg-[#39d98a]/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#39d98a]">
                Rescued
              </span>
            </div>

            <p className="mt-5 text-sm text-[#8d9b95]">
              Food rescued
            </p>

            <p className="mt-1 text-3xl font-black text-white">
              {totalFood.toFixed(1)} kg
            </p>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.05,
            }}
            className="rw-card rw-card-hover p-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
              <Package size={19} />
            </div>

            <p className="mt-5 text-sm text-[#8d9b95]">
              Total donations
            </p>

            <p className="mt-1 text-3xl font-black text-white">
              {donations.length}
            </p>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="rw-card rw-card-hover p-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
              <Truck size={19} />
            </div>

            <p className="mt-5 text-sm text-[#8d9b95]">
              Completed deliveries
            </p>

            <p className="mt-1 text-3xl font-black text-white">
              {completedDeliveries}
            </p>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
            }}
            className="rw-card rw-card-hover p-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-400/10 text-purple-300">
              <Activity size={19} />
            </div>

            <p className="mt-5 text-sm text-[#8d9b95]">
              Active pickups
            </p>

            <p className="mt-1 text-3xl font-black text-white">
              {activePickups}
            </p>
          </motion.div>

        </div>

        {/* IMPACT STRIP */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          className="mt-5 overflow-hidden rounded-[20px] border border-[#1d3028] bg-[#0d1915]"
        >
          <div className="grid md:grid-cols-3">

            <div className="border-b border-[#1d3028] p-6 md:border-b-0 md:border-r">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#53615b]">
                Food rescued
              </p>

              <p className="mt-2 text-3xl font-black text-white">
                {totalFood.toFixed(1)} kg
              </p>

              <p className="mt-1 text-xs text-[#53615b]">
                Successfully delivered
              </p>
            </div>

            <div className="border-b border-[#1d3028] p-6 md:border-b-0 md:border-r">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#53615b]">
                Estimated meals
              </p>

              <p className="mt-2 text-3xl font-black text-[#39d98a]">
                {estimatedMeals}
              </p>

              <p className="mt-1 text-xs text-[#53615b]">
                Demo estimate: 2 meals per kg
              </p>
            </div>

            <div className="p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#53615b]">
                Rescue success
              </p>

              <p className="mt-2 text-3xl font-black text-white">
                {rescueSuccess}%
              </p>

              <p className="mt-1 text-xs text-[#53615b]">
                Completed deliveries vs donations
              </p>
            </div>

          </div>
        </motion.div>

        {/* CHARTS */}

        <div className="mt-10 grid gap-5 lg:grid-cols-2">

          {/* LINE CHART */}

          <div className="rw-card p-6">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#39d98a]">
                  Rescue trend
                </p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  Food rescued over time
                </h2>

                <p className="mt-1 text-sm text-[#8d9b95]">
                  Delivered food grouped by donation date.
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#39d98a]/10 text-[#39d98a]">
                <BarChart3 size={17} />
              </div>
            </div>

            <div className="mt-8 h-72">

              {dailyFoodData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={dailyFoodData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      stroke="#1d3028"
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "#53615b",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "#53615b",
                        fontSize: 11,
                      }}
                      unit=" kg"
                    />

                    <Tooltip
                      contentStyle={{
                        background:
                          "#0d1915",
                        border:
                          "1px solid #1d3028",
                        borderRadius:
                          "12px",
                        color: "#fff",
                      }}
                      formatter={(value) => [
                        `${value} kg`,
                        "Food Rescued",
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="food"
                      stroke="#39d98a"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#39d98a",
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[#1d3028] bg-[#07100d] text-center">
                  <div>
                    <BarChart3
                      size={30}
                      className="mx-auto text-[#53615b]"
                    />

                    <p className="mt-3 font-semibold text-white">
                      Rescue trend will appear here
                    </p>

                    <p className="mt-1 text-sm text-[#53615b]">
                      Complete a food delivery to generate data.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* CATEGORY CHART */}

          <div className="rw-card p-6">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#39d98a]">
                  Food mix
                </p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  Rescued food categories
                </h2>

                <p className="mt-1 text-sm text-[#8d9b95]">
                  Delivered food by category.
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                <Utensils size={17} />
              </div>
            </div>

            <div className="mt-6 h-72">

              {categoryData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={58}
                      paddingAngle={3}
                    >
                      {categoryData.map(
                        (_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              chartColors[
                                index %
                                  chartColors.length
                              ]
                            }
                            stroke="none"
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        background:
                          "#0d1915",
                        border:
                          "1px solid #1d3028",
                        borderRadius:
                          "12px",
                        color: "#fff",
                      }}
                      formatter={(value) => [
                        `${value} kg`,
                        "Food",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[#1d3028] bg-[#07100d] text-center">
                  <div>
                    <Utensils
                      size={30}
                      className="mx-auto text-[#53615b]"
                    />

                    <p className="mt-3 font-semibold text-white">
                      No category data yet
                    </p>
                  </div>
                </div>
              )}

            </div>

            {categoryData.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2">
                {categoryData.map(
                  (category, index) => (
                    <div
                      key={category.name}
                      className="flex items-center gap-2 text-xs text-[#8d9b95]"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            chartColors[
                              index %
                                chartColors.length
                            ],
                        }}
                      />

                      {category.name}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

        </div>

        {/* PIPELINE */}

        <div className="rw-card mt-5 p-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#39d98a]">
                Live pipeline
              </p>

              <h2 className="mt-2 text-xl font-bold text-white">
                Where are the donations now?
              </h2>

              <p className="mt-1 text-sm text-[#8d9b95]">
                Current state of every donation in the system.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#53615b]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#39d98a]" />
              Live data
            </div>

          </div>

          <div className="mt-8 h-72">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={statusData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  stroke="#1d3028"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#53615b",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#53615b",
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    background:
                      "#0d1915",
                    border:
                      "1px solid #1d3028",
                    borderRadius:
                      "12px",
                    color: "#fff",
                  }}
                />

                <Bar
                  dataKey="count"
                  fill="#39d98a"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>

        {/* QUICK ACTIONS */}

        <section className="mt-12">

          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#39d98a]">
              Shortcuts
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Quick actions
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            <Link
              href="/donate"
              className="group overflow-hidden rounded-[18px] border border-[#39d98a]/25 bg-[#39d98a] p-6 text-[#07100d] transition hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#07100d]/10">
                  <Utensils size={20} />
                </div>

                <ArrowRight
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>

              <h3 className="mt-7 text-xl font-black">
                Donate food
              </h3>

              <p className="mt-2 text-sm text-[#174b34]">
                Register surplus food and start a rescue.
              </p>
            </Link>

            <Link
              href="/match"
              className="rw-card rw-card-hover group p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-400/10 text-purple-300">
                  <ShieldCheck size={19} />
                </div>

                <ArrowRight
                  size={18}
                  className="text-[#53615b] transition-transform group-hover:translate-x-1 group-hover:text-white"
                />
              </div>

              <h3 className="mt-7 text-xl font-bold text-white">
                Smart matching
              </h3>

              <p className="mt-2 text-sm text-[#8d9b95]">
                Find a suitable shelter for a donation.
              </p>
            </Link>

            <Link
              href="/volunteer"
              className="rw-card rw-card-hover group p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                  <Truck size={19} />
                </div>

                <ArrowRight
                  size={18}
                  className="text-[#53615b] transition-transform group-hover:translate-x-1 group-hover:text-white"
                />
              </div>

              <h3 className="mt-7 text-xl font-bold text-white">
                Volunteer
              </h3>

              <p className="mt-2 text-sm text-[#8d9b95]">
                Manage food rescue pickups and deliveries.
              </p>
            </Link>

          </div>
        </section>

        {/* RECENT DONATIONS */}

        <section className="mt-12">

          <div className="mb-5 flex items-end justify-between">

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#39d98a]">
                Activity
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Recent donations
              </h2>

              <p className="mt-1 text-sm text-[#8d9b95]">
                Latest food rescue activity.
              </p>
            </div>

            <span className="hidden text-xs text-[#53615b] sm:block">
              Showing latest 5
            </span>

          </div>

          <div className="overflow-hidden rounded-[18px] border border-[#1d3028] bg-[#0d1915]">

            {donations.length === 0 ? (
              <div className="p-12 text-center">
                <Package
                  size={32}
                  className="mx-auto text-[#53615b]"
                />

                <h3 className="mt-4 font-bold text-white">
                  No donations yet
                </h3>

                <p className="mt-2 text-sm text-[#8d9b95]">
                  Your first rescue starts here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#1d3028]">

                {donations
                  .slice(0, 5)
                  .map((donation) => {

                    const statusStyles =
                      donation.status ===
                      "delivered"
                        ? "border-[#39d98a]/20 bg-[#39d98a]/5 text-[#39d98a]"
                        : donation.status ===
                          "picked_up"
                        ? "border-blue-400/20 bg-blue-400/5 text-blue-300"
                        : donation.status ===
                          "pickup_assigned"
                        ? "border-amber-400/20 bg-amber-400/5 text-amber-300"
                        : donation.status ===
                          "matched"
                        ? "border-purple-400/20 bg-purple-400/5 text-purple-300"
                        : "border-[#1d3028] bg-[#07100d] text-[#8d9b95]";

                    return (
                      <div
                        key={donation.id}
                        className="flex flex-col justify-between gap-4 p-5 transition hover:bg-[#101f1a] md:flex-row md:items-center"
                      >

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#07100d] text-[#39d98a]">
                            <Package size={17} />
                          </div>

                          <div>
                            <p className="font-semibold capitalize text-white">
                              {donation.food_category} food
                            </p>

                            <p className="mt-1 flex items-center gap-2 text-xs text-[#53615b]">
                              <span>
                                {donation.quantity_kg} kg
                              </span>

                              <span>•</span>

                              <span>
                                {new Date(
                                  donation.created_at
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </p>
                          </div>

                        </div>

                        <span
                          className={`w-fit rounded-full border px-3 py-1.5 text-[11px] font-bold capitalize ${statusStyles}`}
                        >
                          {donation.status.replace(
                            "_",
                            " "
                          )}
                        </span>

                      </div>
                    );
                  })}

              </div>
            )}

          </div>
        </section>

        {/* ACCOUNT */}

        {profile && (
          <section className="mt-10">

            <div className="rw-card p-6">

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#39d98a]/10 text-[#39d98a]">
                  <Users size={19} />
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#53615b]">
                    Account
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-white">
                    Profile details
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-3">

                <div>
                  <p className="text-xs text-[#53615b]">
                    Name
                  </p>

                  <p className="mt-1 font-semibold text-white">
                    {profile.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#53615b]">
                    Email
                  </p>

                  <p className="mt-1 break-all font-semibold text-white">
                    {profile.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#53615b]">
                    Role
                  </p>

                  <p className="mt-1 font-semibold capitalize text-[#39d98a]">
                    {profile.role}
                  </p>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* FOOTER */}

        <footer className="mt-12 border-t border-[#1d3028] pt-6 text-center">
          <p className="text-xs text-[#53615b]">
            RescueWavy · Giving surplus food a second destination.
          </p>
        </footer>

      </section>
    </main>
  );
}