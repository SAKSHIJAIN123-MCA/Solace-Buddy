"use client"

import { Badge } from "../ui/badge"

const areas = ["Thaltej", "Satellite", "Vastrapur", "Navrangpura", "Bodakdev", "Prahlad Nagar", "Memnagar"]

export function CoverageSection() {
  return (
    <section aria-labelledby="why-choose" className="bg-gray-50">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 md:grid-cols-2 md:gap-12 items-start">
        {/* Image */}
        <div className="h-full">
          <img
            src="/3[1].png"
            alt="Friends cooking and dining together in a warm kitchen."
            className="h-full w-full rounded-2xl object-cover "
          />
        </div>

        {/* Text Content */}
       <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 id="coverage" className="text-2xl md:text-3xl font-bold text-pretty mb-4">
          What we Serve.
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Looking for a PG in Ahmedabad? SolaceBuddy covers multiple areas including PG in Thaltej, PG in Satellite, PG
          in Vastrapur, PG in Navrangpura, PG in Bodakdev, PG in Prahlad Nagar, and PG in Memnagar. Our platform is
          perfect for bachelor stays in Ahmedabad, especially for students and working professionals looking for
          verified options near their workplace or university.
        </p>

        <div className="flex flex-wrap gap-2">
          {areas.map((a) => (
            <Badge key={a} variant="default" className="bg-[#2e057f] text-white border border-brand/20">
              {a}
            </Badge>
          ))}
        </div>
          <p className="text-muted-foreground leading-relaxed mt-6">
          Explore bachelor accommodations, PG rooms, shared flats, and affordable hostels – all at SolaceBuddy.com. We
          are presently available in limited locations but are rapidly expanding and will soon be available in multiple
          cities across India.
        </p>
 </div>
      </div>
    </section>
  )
}
