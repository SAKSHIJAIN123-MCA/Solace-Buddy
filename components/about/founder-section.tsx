"use client"

export function FounderSection() {
  return (
    <section aria-labelledby="founder" className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 id="founder" className="text-2xl md:text-3xl font-bold text-pretty mb-6">
          About the Founder
        </h2>
        <div className="rounded-2xl border bg-card p-6">
          <p className="leading-relaxed text-muted-foreground">
            Myself <strong className="text-[#2e057f]">Arpan Shah</strong> – a young, engineering-background entrepreneur –
            created this mammoth technical facility to bridge the gaps in finding suitable accommodations. I have been
            in the bachelor accommodation business since July 2023, gaining practical experience and understanding of
            what tenants and PG owners truly need.
          </p>
          <p className="leading-relaxed text-muted-foreground mt-4">
            Founded in early 2025, SolaceBuddy quickly gained popularity by offering a smart, transparent, and
            tech-enabled solution for PG seekers in Ahmedabad. My goal is to empower tenants with choices and bring
            professionalism and ease to the PG discovery process.
          </p>
        </div>
      </div>
    </section>
  )
}
