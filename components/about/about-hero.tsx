"use client";

import { Button } from "@/components/ui/button";

export function AboutHero() {
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:gap-12 items-start">
          {/* Text Content */}
          <div className="flex flex-col items-start space-y-5 self-start">
            <h1 className="text-pretty text-3xl font-bold leading-tight md:text-4xl">
              About Us — <span className="text-[#2e057f]">SolaceBuddy.com</span>
            </h1>
            <p className="leading-relaxed text-muted-foreground">
              Welcome to SolaceBuddy.com – your trusted digital companion in
              finding the perfect PG accommodation.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              We are a tech-driven platform designed to bridge the gap between
              tenants looking for genuine Paying Guest (PG) stays and PG owners
              who want to fill their vacancies transparently.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Our mission is to simplify the house-hunting experience while
              ensuring clarity, communication, and convenience at every step.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              To make the PG discovery and onboarding experience effortless and
              stress-free by providing verified options, reliable handholding
              support, secure data handling, and a tenant-first approach — all
              powered by technology.
            </p>
            <Button
              asChild
              className="mt-4 py-4 bg-[#2e057f] text-white hover:opacity-90"
            >
              <a href="/properties">Explore Properties</a>
            </Button>
          </div>

          {/* Image - top aligned */}
          <div className="relative self-start">
            <figure className="relative overflow-hidden rounded-3xl">
              <img
                src="/1[1].png"
                alt="SolaceBuddy community-friendly living"
                className="w-full h-auto object-cover rounded-3xl"
                loading="lazy"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
