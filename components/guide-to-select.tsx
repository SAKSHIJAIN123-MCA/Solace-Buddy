import Link from "next/link";

export default function GuideToSelect() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2e057f] mb-8 text-center">
          Guide to Select the Right Stay
        </h2>

        <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-80 md:h-96">
            <img
              src="/hero2.jpg"
              alt="Guide to selecting the right stay"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Your Complete Guide to Finding the Perfect Stay
              </h3>
              <p className="text-gray-200 mb-4 text-lg">
                Discover expert tips, location insights, and essential factors to consider when choosing your ideal
                accommodation.
              </p>
              <Link href={"/blog"}>
              <button className="bg-[#2e057f] hover:bg-[#2e057f]/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2">
                Read Full Guide
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
