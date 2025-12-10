"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

type TermsAndConditions = {
  _id: string
  title: string
  description: string
}

export default function TermsAndConditionsPage() {
  const [data, setData] = useState<TermsAndConditions | null>(null)
  const [loading, setLoading] = useState(true)


   const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await fetch("/api/admin/termsandconditions", {
          cache: "no-store",
        })
        const json = await res.json()
        setData(json?.[0] || null) // assuming only one terms and conditions entry
      } catch (error) {
        console.error("Failed to load terms and conditions", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPolicy()
  }, [])

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Top Heading */}
     <div className="relative h-[20vh] md:h-[30vh] overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-[#2e057f] via-[#4c1d95] to-[#6b21a8] flex items-center">
    <div className="container mx-auto px-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="max-w-2xl text-white"
      >
        <h1 className="text-4xl font-semibold mb-4">
          {data?.title || "Terms and Conditions"}
        </h1>
        <p className="text-lg md:text-xl opacity-90">
          {" By accessing or using the website, you agree to comply with and be bound by these Terms."}
        </p>
      </motion.div>
    </div>
  </div>
</div>


      {/* Full-width Content Box */}
      <div className="w-full px-4 py-10">
        <div className=" rounded-lg w-full p-8 text-[19px] leading-relaxed space-y-6">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : data ? (
            <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: data.description }} />
          ) : (
            <div className="text-center text-red-500">No Terms and Conditions found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
