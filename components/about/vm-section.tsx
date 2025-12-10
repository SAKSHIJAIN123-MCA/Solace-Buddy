"use client"

export function VisionMission() {
  return (
    <section aria-labelledby="vision-mission" className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 id="vision-mission" className="text-2xl md:text-3xl font-bold text-pretty mb-8">
          Vision & Mission
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Vision */}
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="text-xl font-semibold mb-2 text-[#2e057f]">Vision...</h3>
            <p className="leading-relaxed text-muted-foreground">
              To become India’s most reliable and tech-enabled platform for PG accommodations by building trust,
              ensuring transparency, and empowering both tenants and property owners through innovation and service
              excellence.
            </p>
          </div>

          {/* Mission */}
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="text-xl font-semibold mb-2 text-[#2e057f]">Mission...</h3>
            <p className="leading-relaxed text-muted-foreground">
              To make the PG discovery and onboarding experience effortless and stress-free by providing verified
              options, reliable handholding support, secure data handling, and a tenant-first approach — all powered by
              technology.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
