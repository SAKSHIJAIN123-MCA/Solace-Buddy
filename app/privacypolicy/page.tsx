"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

type PrivacyPolicy = {
  _id: string
  title: string
  description: string
}

export default function PrivacyPolicyPage() {
  const [data, setData] = useState<PrivacyPolicy | null>(null)
  const [loading, setLoading] = useState(true)


    const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await fetch("/api/admin/privacypolicy", {
          cache: "no-store",
        })
        const json = await res.json()
        setData(json?.[0] || null) // assuming only one policy entry
      } catch (error) {
        console.error("Failed to load privacy policy", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPolicy()
  }, [])

  return (
    <div className="flex flex-col w-full  min-h-screen">
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
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {data?.title || "Privacy Policy"}
        </h1>
        <p className="text-lg md:text-xl opacity-90 ml-2">
          { "This Privacy Policy explains how we collect, use, and protect your information."}
        </p>
      </motion.div>
    </div>
  </div>
</div>

     

      {/* Full-width Content Box with max-width and centering */}
     <div className="w-full px-4 py-5">
        {" "}
        {/* Added this wrapper div */}
        <div className=" rounded-lg  w-full p-8 text-[19px] leading-relaxed space-y-6">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : data ? (
            <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: data.description }} />
          ) : (
            <div className="text-center text-red-500">No Privacy Policy found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
