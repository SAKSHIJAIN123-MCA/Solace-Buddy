"use client";

export function WhatWeDoAndPromise() {
  return (
    <section aria-labelledby="what-we-do" className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid items-start gap-10 md:grid-cols-2">
          {/* Text Content */}
          <div className="space-y-8 self-start">
            {/* What We Do */}
            <div className="space-y-5">
              <h2
                id="what-we-do"
                className="text-2xl md:text-3xl font-bold text-pretty"
              >
                What <span className="text-[#2e057f]">We Do ?</span>
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="leading-relaxed">
                  • Match tenants with verified PG options based on preferences
                  and needs.
                </li>
                <li className="leading-relaxed">
                  • Provide transparent property details, photographs, and
                  availability as shared by PG owners.
                </li>
                <li className="leading-relaxed">
                  • Facilitate smooth booking, payment, and onboarding processes.
                </li>
                <li className="leading-relaxed">
                  • Offer free property visits and human assistance till move-in.
                </li>
              </ul>
            </div>

            {/* Our Promise */}
            <div className="space-y-5">
              <h2
                id="our-promise"
                className="text-2xl md:text-3xl font-bold text-pretty"
              >
                Our <span className="text-[#2e057f]">Promise...</span>
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="leading-relaxed">
                  • No hidden fees or brokerage from the tenant side.
                </li>
                <li className="leading-relaxed">
                  • Honest listings with all available details.
                </li>
                <li className="leading-relaxed">
                  • Secure handling of user data and legal KYC processing.
                </li>
              </ul>
            </div>
          </div>

          {/* Image */}
          <div className="relative w-full self-start">
            <figure className="w-full overflow-hidden rounded-xl">
              <img
                src="/how-to-book/1[1].png"
                alt="Tech-enabled discovery and onboarding"
                className="w-full h-auto object-cover rounded-xl"
                loading="lazy"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
