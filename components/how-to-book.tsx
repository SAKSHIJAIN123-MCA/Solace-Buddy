import Link from "next/link";

export default function HowToBook() {
  const steps = [
    {
      number: "01",
      title: "Explore 100+ options on SolaceBuddy",
      description:
        "Browse through a wide range of verified stay options tailored to your preferences and budget.",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Shortlist self / taking a help of Solace Experts",
      description:
        "Book a free assisted visit to see the property in person. Our team will guide you through the space and answer all your questions about the accommodation.",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-9 0v10a2 2 0 002 2h8a2 2 0 002-2V7H7z"
          />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Schedule a free visit",
      description:
        "Complete your booking with just a token amount. We'll handle all the paperwork and coordinate with the property owner for a seamless move-in experience.",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      number: "04",
      title: "Confirm the Stay",
      description:
        "Complete your booking with just a token amount. We'll handle all the paperwork and coordinate with the property owner for a seamless move-in experience.",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How to <span className="text-[#2e057f]">Book?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple, transparent, and hassle-free booking process designed for
            students and working professionals
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          {/* Left side - Image */}
          <div className="relative h-full flex">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-400 p-8 flex-1 flex flex-col">
              <img
                src="/happy-student-moving.png"
                alt="Student ready to book accommodation"
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3">
                <svg
                  className="w-6 h-6 text-[#2e057f]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Right side - Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-6 group">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-[#2e057f] text-white rounded-full flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-200">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#2e057f]/10 rounded-full flex items-center justify-center text-[#2e057f]">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16">
          <div className="bg-[#2e057f] rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
            {/* Left Side - Text */}
            <div className="text-center md:text-left max-w-xl">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Find Your Perfect Stay?
              </h3>
              <p className="text-white/90 mb-2">
                Join thousands of satisfied students and professionals who found
                their ideal accommodation through SolaceBuddy.
              </p>
            </div>

            {/* Right Side - Buttons */}
            <div className="flex flex-col gap-3 w-full md:w-auto text-center md:text-right">
              <Link href="/properties">
                <button className="bg-white text-[#2e057f] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-flex items-center justify-center gap-2 w-full md:w-auto">
                  Explore Options
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

              <a
                href="https://wa.me/919662347192"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 inline-flex items-center justify-center gap-2 w-full md:w-auto"
              >
                Whatsapp Us
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 20l1.5-4.5A9 9 0 1112 21a9.04 9.04 0 01-4.5-1.2L3 20z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
