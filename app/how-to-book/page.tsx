"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HowToBook() {
  const steps = [
    {
      number: "01",
      title: "Explore 100+ Options on SolaceBuddy",
      description: `
    • 100% Verified PG Properties in Ahmedabad  
    • Real-Time Bed & Room Availability  
    • Genuine, Verified Reviews from Tenants  
    • Free Expert Advice & Unlimited Visits
  `,
      img: "/1[1].png",
      bg: "bg-gray-100",
    },

    {
      number: "02",
      title: "Shortlist self / taking a help of Solace Experts",
      description: `
       Browse and shortlist PGs on your own — or let our Solace Experts do it for you. We understand your needs, compare options, and guide you to the perfect stay — saving your time and effort.

      `,
      img: "/2[1].png",
    },
    {
      number: "03",
      title: "Schedule a Free Visit",
      description: `
        Book a visit anytime and explore PGs at your convenience. Enjoy unlimited visits until you find the perfect stay — no charges, no limits.

      `,
      img: "/3[1].png",
      bg: "bg-[#f3f0ff]",
    },
    {
      number: "04",
      title: "Confirm the Stay",
      description: `
       Secure your PG instantly by paying just the booking amount. Simple, fast, and hassle-free!

      `,
      img: "/4[1].png",
    },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Steps */}
        <div className="space-y-20">
          {steps.map((step, index) => (
            <motion.section
              key={step.number}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              className={`relative overflow-hidden ${step.bg} rounded-3xl`}
            >
              <div
                className={`relative mx-auto max-w-6xl px-6 py-14 grid items-center gap-10 md:grid-cols-2 md:gap-16`}
              >
                {/* Content */}
                <div
                  className={`flex flex-col items-start space-y-5 z-10 ${
                    index % 2 !== 0 ? "md:order-2" : ""
                  }`}
                >
                  <Badge
                    variant="secondary"
                    className="text-[#2e057f] font-semibold text-sm"
                  >
                    Step {step.number}
                  </Badge>
                  <h1 className="text-3xl font-bold leading-tight text-gray-900">
                    {step.title}
                  </h1>
                  <p className="leading-relaxed text-gray-700 whitespace-pre-line">
                    {step.description}
                  </p>
                </div>

                {/* Image */}
                <div
                  className={`relative z-10 ${
                    index % 2 !== 0 ? "md:order-1" : ""
                  }`}
                >
                  <figure className="relative overflow-hidden rounded-3xl ">
                    <div className="aspect-square w-full">
                      <img
                        src={step.img}
                        alt={step.title}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                  </figure>
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-24 text-center"
        >
          <div className="bg-[#2e057f] rounded-2xl p-10 text-white max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Find Your Perfect Stay?
            </h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              That’s it! Now your stay is confirmed. You will additionally get a{" "}
              <strong>Joining Kit</strong> also by booking through SolaceBuddy.
            </p>
            <Link href={"/properties"}>
              <button className="bg-white text-[#2e057f] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-flex items-center gap-2">
                Start Your Search
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
