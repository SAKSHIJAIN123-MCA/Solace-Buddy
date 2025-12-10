"use client"

import { Button } from "@/components/ui/button"

export function IntroSection() {
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="grid items-start gap-10 md:grid-cols-2 md:gap-12">
          {/* Left: Expanded content */}
          <div className="flex flex-col items-start space-y-5">
            <h1 className="text-pretty text-3xl font-bold leading-tight md:text-3xl">
              Discover homes as unique as your <span className="text-[#2e057f]">Lifestyle</span>
            </h1>

            <p className="leading-relaxed text-muted-foreground">
              We thoughtfully curate homes across different micro‑markets, matching specific needs—from quiet streets to
              vibrant districts near restaurants and cinemas. There is no one‑size‑fits‑all home.
            </p>

            <p className="leading-relaxed text-muted-foreground">
              Whether you want the beach, tranquility, or quick access to work or college, our mission is to offer a
              diverse range of options so there's one for everyone.
            </p>

            <p className="leading-relaxed text-muted-foreground">
              By reducing commute time and removing friction, we help you move from compromise to comfort—making the
              most of each day. By reducing commuting time and providing hassle-free homes that align with their
              lifestyle, we help renters transition from compromised living situations to a more fulfilling and
              enriching way of life, allowing them to make the most of each day.
            </p>

            <Button asChild className="mt-6 bg-[#2f0c76] hover:bg-teal-700">
              <a href="/properties">Explore Homes</a>
            </Button>
          </div>

          {/* Right: Single square image (equal column width, square shape) */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-3xl" />
            <figure className="relative overflow-hidden rounded-3xl ">
              {/* aspect-square keeps a perfect square like Shopify cards */}
              <div className="aspect-square w-full">
                <img
                  src="/Artboard 3.png"
                  alt="Friendly community in a warm, home-like kitchen setting"
                  className="h-full w-full object-cover"
                />
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
