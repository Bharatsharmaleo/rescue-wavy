"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  MapPin,
  Package,
  Plus,
  Route,
  ShieldCheck,
  Sparkles,
  Truck,
  Utensils,
  Users,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Package,
    title: "Post surplus",
    text: "Add the food type, quantity, location and pickup deadline.",
  },
  {
    number: "02",
    icon: Route,
    title: "Find a match",
    text: "RescueWavy checks suitable shelters and creates a rescue match.",
  },
  {
    number: "03",
    icon: Truck,
    title: "Arrange pickup",
    text: "A volunteer accepts the pickup and moves the food to its destination.",
  },
  {
    number: "04",
    icon: HeartHandshake,
    title: "Complete rescue",
    text: "The shelter receives the food and the rescue is recorded.",
  },
];

const roles = [
  {
    icon: Utensils,
    title: "Food Donors",
    text: "Restaurants, cafeterias and caterers can quickly post food that would otherwise go unused.",
  },
  {
    icon: Users,
    title: "Shelters & NGOs",
    text: "Shelters can receive suitable surplus based on their capacity, food type and location.",
  },
  {
    icon: Truck,
    title: "Volunteers",
    text: "Volunteers can see available pickups and help move food from the donor to the shelter.",
  },
];

const matchingFactors = [
  {
    icon: MapPin,
    title: "Distance",
    text: "Nearby locations are considered.",
  },
  {
    icon: Package,
    title: "Capacity",
    text: "Available shelter capacity matters.",
  },
  {
    icon: Utensils,
    title: "Food type",
    text: "Compatible food categories are checked.",
  },
  {
    icon: Clock3,
    title: "Urgency",
    text: "Pickup deadlines help prioritize rescues.",
  },
];
function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[#1d3028] bg-[#07100d]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#39d98a] text-sm font-black text-[#07100d]">
            R
          </div>

          <span className="text-lg font-bold tracking-tight text-white">
            RescueWavy
          </span>
        </Link>

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

        <Link
          href="/login"
          className="rounded-xl border border-[#1d3028] px-4 py-2 text-sm text-[#dce4e0] md:hidden"
        >
          Login
        </Link>

      </div>
    </nav>
  );
}
export default function Home() {
  return (
    <main className="rw-page min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1d3028] bg-[#0d1915] px-4 py-2 text-sm text-[#a9b8b1]">
              <span className="h-2 w-2 rounded-full bg-[#39d98a]" />
              Food rescue, coordinated simply
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-7xl">
              Good food
              <br />
              should reach
              <br />
              <span className="text-[#39d98a]">someone who needs it.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-[#8d9b95] md:text-lg">
              RescueWavy connects surplus food with suitable shelters and
              volunteers, turning a simple donation into a coordinated rescue.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/donate"
                className="rw-button-primary inline-flex items-center gap-2"
              >
                Start a rescue
                <ArrowRight size={18} />
              </Link>

              <a
                href="#how-it-works"
                className="rw-button-secondary inline-flex items-center gap-2"
              >
                See how it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#718079]">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#39d98a]" />
                Donor to shelter
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#39d98a]" />
                Volunteer pickups
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#39d98a]" />
                Rescue tracking
              </span>
            </div>
          </motion.div>

          {/* PRODUCT PREVIEW */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-10 -z-10 bg-[#39d98a]/5 blur-3xl" />

            <div className="rw-card overflow-hidden p-3 shadow-2xl">
              <div className="rounded-[14px] border border-[#1d3028] bg-[#09130f]">
                {/* Fake browser header */}
                <div className="flex items-center justify-between border-b border-[#1d3028] px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#263c32]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#263c32]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#263c32]" />
                  </div>

                  <span className="text-xs text-[#5f6e68]">
                    RescueWavy / active rescue
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#718079]">
                        Active rescue
                      </p>

                      <h3 className="mt-2 text-2xl font-semibold text-white">
                        10 kg cooked food
                      </h3>
                    </div>

                    <span className="rounded-full border border-[#28583f] bg-[#10271d] px-3 py-1 text-xs font-semibold text-[#65e0a0]">
                      MATCHED
                    </span>
                  </div>

                  <div className="mt-8">
                    {/* Donor */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#284136] bg-[#102019]">
                        <Utensils size={19} className="text-[#39d98a]" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-white">
                          Food donor
                        </p>
                        <p className="mt-1 text-xs text-[#718079]">
                          Surplus posted
                        </p>
                      </div>
                    </div>

                    <div className="ml-[21px] h-9 border-l border-dashed border-[#315443]" />

                    {/* Match */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#284136] bg-[#102019]">
                        <MapPin size={19} className="text-[#39d98a]" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-white">
                          Suitable shelter
                        </p>
                        <p className="mt-1 text-xs text-[#718079]">
                          Match confirmed
                        </p>
                      </div>
                    </div>

                    <div className="ml-[21px] h-9 border-l border-dashed border-[#315443]" />

                    {/* Volunteer */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#284136] bg-[#102019]">
                        <Truck size={19} className="text-[#39d98a]" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-white">
                          Volunteer pickup
                        </p>
                        <p className="mt-1 text-xs text-[#718079]">
                          Ready for collection
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#1d3028] bg-[#0d1915] p-4">
                      <p className="text-xs text-[#718079]">Food type</p>
                      <p className="mt-1 text-sm font-medium text-white">
                        Cooked
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#1d3028] bg-[#0d1915] p-4">
                      <p className="text-xs text-[#718079]">Status</p>
                      <p className="mt-1 text-sm font-medium text-[#65e0a0]">
                        In progress
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SMALL INTRO */}
      <section className="border-y border-[#1d3028] bg-[#09130f]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#39d98a]">
              A simple rescue pipeline
            </p>
            <p className="mt-1 text-sm text-[#718079]">
              Post → Match → Pick up → Deliver
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#718079]">
            <ShieldCheck size={17} className="text-[#39d98a]" />
            Every step is tracked inside one platform.
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#39d98a]">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
              From surplus to shelter
              <br />
              without the confusion.
            </h2>

            <p className="mt-5 leading-7 text-[#8d9b95]">
              RescueWavy keeps the important parts of a food rescue in one
              place, so donors, shelters and volunteers know what happens
              next.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.07,
                  }}
                  className="rw-card rw-card-hover p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#39d98a]">
                      {step.number}
                    </span>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1d3028] bg-[#101f1a]">
                      <Icon size={18} className="text-[#39d98a]" />
                    </div>
                  </div>

                  <h3 className="mt-8 text-lg font-semibold text-white">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#718079]">
                    {step.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SMART MATCHING */}
      <section className="border-y border-[#1d3028] bg-[#09130f]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-[#28583f] bg-[#10271d]">
              <Sparkles size={20} className="text-[#39d98a]" />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#39d98a]">
              Smart matching
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
              The nearest shelter isn't always the right match.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-[#8d9b95]">
              RescueWavy looks at several practical factors before suggesting
              where a donation should go.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {matchingFactors.map((factor, index) => {
              const Icon = factor.icon;

              return (
                <motion.div
                  key={factor.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.06,
                  }}
                  className="rw-card p-6"
                >
                  <Icon size={20} className="text-[#39d98a]" />

                  <h3 className="mt-5 font-semibold text-white">
                    {factor.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#718079]">
                    {factor.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#39d98a]">
              One platform
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">
              Different people. One rescue.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-[#8d9b95]">
              Everyone involved in the process gets a role designed around
              what they actually need to do.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {roles.map((role, index) => {
              const Icon = role.icon;

              return (
                <motion.div
                  key={role.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                  }}
                  className="rw-card rw-card-hover p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#1d3028] bg-[#101f1a]">
                    <Icon size={21} className="text-[#39d98a]" />
                  </div>

                  <h3 className="mt-7 text-xl font-semibold text-white">
                    {role.title}
                  </h3>

                  <p className="mt-3 leading-7 text-[#718079]">
                    {role.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI FEATURE */}
      <section className="border-t border-[#1d3028]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="rw-card overflow-hidden">
            <div className="grid md:grid-cols-[1fr_0.8fr]">
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10271d]">
                    <Sparkles size={19} className="text-[#39d98a]" />
                  </div>

                  <span className="text-sm font-semibold text-[#39d98a]">
                    AI-assisted food entry
                  </span>
                </div>

                <h2 className="mt-6 max-w-xl text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Less typing. Better structured donations.
                </h2>

                <p className="mt-5 max-w-xl leading-7 text-[#8d9b95]">
                  Donors can describe their surplus in normal language.
                  RescueWavy can analyse the description and suggest an
                  appropriate food category before the donation is submitted.
                </p>

                <Link
                  href="/donate"
                  className="rw-button-secondary mt-8 inline-flex items-center gap-2"
                >
                  Try food entry
                  <ArrowRight size={17} />
                </Link>
              </div>

              <div className="border-t border-[#1d3028] bg-[#09130f] p-8 md:border-l md:border-t-0 md:p-12">
                <p className="text-xs uppercase tracking-[0.16em] text-[#5f6e68]">
                  Example
                </p>

                <div className="mt-5 rounded-xl border border-[#1d3028] bg-[#0d1915] p-5">
                  <p className="text-xs text-[#718079]">Donor description</p>

                  <p className="mt-3 text-sm leading-6 text-[#dce4e0]">
                    “Around 10 kg of cooked rice and dal left after today&apos;s
                    event.”
                  </p>
                </div>

                <div className="my-4 flex justify-center text-[#315443]">
                  ↓
                </div>

                <div className="rounded-xl border border-[#28583f] bg-[#10271d] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#718079]">Suggested category</p>

                    <CheckCircle2 size={16} className="text-[#39d98a]" />
                  </div>

                  <p className="mt-2 text-lg font-semibold text-white">
                    Cooked food
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-[#1d3028] bg-[#09130f]">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#28583f] bg-[#10271d]">
            <HeartHandshake size={22} className="text-[#39d98a]" />
          </div>

          <h2 className="mt-7 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Have surplus food?
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-[#8d9b95]">
            Start a rescue and let the platform handle the next steps.
          </p>

          <Link
            href="/donate"
            className="rw-button-primary mt-8 inline-flex items-center gap-2"
          >
            Donate surplus food
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1d3028] bg-[#050b08]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#39d98a] text-sm font-black text-[#07100d]">
              R
            </div>

            <span className="font-semibold text-white">RescueWavy</span>
          </div>

          <p className="text-[#5f6e68]">
            Turning surplus food into someone's next meal.
          </p>
        </div>
      </footer>
    </main>
  );
}