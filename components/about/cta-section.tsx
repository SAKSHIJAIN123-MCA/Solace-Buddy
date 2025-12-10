"use client"

import Link from "next/link"

export function CTASection() {
  return (
    <section aria-labelledby="cta" className="bg-background">
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div className="bg-[#2e057f] rounded-2xl p-8 text-white text-center">
          <h3 id="cta" className="text-2xl font-bold mb-3">
            Ready to Find Your Perfect Stay?
          </h3>
          <p className="opacity-95 mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied students and professionals who found their ideal accommodation through
            SolaceBuddy.
          </p>
          <Link href={"/properties"}>
            <button className="bg-white text-[#2e057f] px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-colors duration-200">
              Start Your Search
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
