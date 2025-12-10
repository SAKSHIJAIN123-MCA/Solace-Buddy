"use client"

export function WhyChoose() {
  return (
    <section aria-labelledby="why-choose" className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 id="why-choose" className="text-2xl md:text-3xl font-bold text-pretty mb-6">
          Why Choose <span className="text-[#2e057f]">SolaceBuddy</span>?
        </h2>
        <ul className="space-y-3 text-muted-foreground">
          <li className="leading-relaxed">• Local expertise with real-time availability insights.</li>
          <li className="leading-relaxed">• Supportive handholding throughout the PG selection process.</li>
          <li className="leading-relaxed">• Strong owner network, helping reduce your time and effort.</li>
        </ul>
        <p className="mt-6 leading-relaxed">
          We’re not just a listing site – we’re your PG journey partner. Whether you’re a student, working professional,
          or new to the city, SolaceBuddy is here to help you settle in comfortably.
        </p>
        <p className="mt-2 leading-relaxed">Let’s make finding a PG easier, smarter, and stress-free — together.</p>
      </div>
    </section>
  )
}
