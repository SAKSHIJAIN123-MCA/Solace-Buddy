"use client"

export function FeatureSection() {
  return (
    <section aria-labelledby="why-choose" className="bg-gray-50">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 md:grid-cols-2 md:gap-12 items-start">
        {/* Image */}
        <div className="h-full">
          <img
            src="/4[1].png"
            alt="Friends cooking and dining together in a warm kitchen."
            className="h-full w-full rounded-2xl object-cover "
          />
        </div>

        {/* Text Content */}
        <div className="space-y-6">
          <h2 id="why-choose" className="text-2xl md:text-3xl font-bold text-pretty">
           Why Choose <span className="text-[#2e057f]">SolaceBuddy</span>?
          </h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="leading-relaxed">
              • Local expertise with real-time availability insights.
            </li>
            <li className="leading-relaxed">
              • Supportive handholding throughout the PG selection process.
            </li>
            <li className="leading-relaxed">
              • Strong owner network, helping reduce your time and effort.
            </li>
          </ul>
          <p className="mt-6 leading-relaxed">
            We’re not just a listing site – we’re your PG journey partner. Whether you’re a student, working professional,
            or new to the city, SolaceBuddy is here to help you settle in comfortably.
          </p>
          <p className="mt-2 leading-relaxed">
            Let’s make finding a PG easier, smarter, and stress-free — together.
          </p>
        </div>
      </div>
    </section>
  )
}
