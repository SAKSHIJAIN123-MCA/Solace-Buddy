"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Users, Home, TrendingUp, type LucideIcon } from "lucide-react"
import * as Icons from "lucide-react"

interface Counter {
  _id: string
  label?: string
  value?: number
  icon?: string
  order?: number
  isActive?: boolean
}

interface AnimatedCounter {
  [key: string]: number
}

export default function WhyChooseSolaceBuddy() {
  const [counters, setCounters] = useState<Counter[]>([])
  const [animatedCounters, setAnimatedCounters] = useState<AnimatedCounter>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCounters()
  }, [])

  const fetchCounters = async () => {
    try {
      const response = await fetch("/api/livecounter")
      const data = await response.json()
      if (data.success) {
        setCounters(data.data)
        // Initialize animated counters
        const initial: AnimatedCounter = {}
        data.data.forEach((counter: Counter) => {
          initial[counter._id] = 0
        })
        setAnimatedCounters(initial)
      }
    } catch (error) {
      console.error("Failed to fetch counters:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (counters.length === 0) return

    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      const newCounters: AnimatedCounter = {}
      counters.forEach((counter) => {
        newCounters[counter._id] = Math.floor((counter.value || 0) * progress)
      })
      setAnimatedCounters(newCounters)

      if (currentStep >= steps) {
        clearInterval(timer)
        const finalCounters: AnimatedCounter = {}
        counters.forEach((counter) => {
          finalCounters[counter._id] = counter.value || 0
        })
        setAnimatedCounters(finalCounters)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [counters])

  const getIcon = (iconName?: string) => {
    if (!iconName) return <Home className="w-8 h-8 text-[#2e057f]" />

    // @ts-ignore - Dynamic icon lookup
    const IconComponent = Icons[iconName] as LucideIcon
    if (IconComponent) {
      return <IconComponent className="w-8 h-8 text-[#2e057f]" />
    }
    return <Home className="w-8 h-8 text-[#2e057f]" />
  }

  const features = [
    {
      icon: <CheckCircle className="w-6 h-6 text-[#2e057f]" />,
      title: "100+ Verified Options",
      description: "Choose from 100+ verified PGs across locations, hand-picked for comfort and quality.",
    },
    {
      icon: <Users className="w-6 h-6 text-[#2e057f]" />,
      title: "Unlimited Free Visits",
      description: "Visit multiple PGs freely — we guide you personally until you find the right stay.",
    },
    {
      icon: <Home className="w-6 h-6 text-[#2e057f]" />,
      title: "Absolutely Free for Tenants",
      description: "Enjoy our complete service without any charge — finding your stay is 100% free.",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-[#2e057f]" />,
      title: "Free Joining Kit",
      description: "Book through us and get a free welcome kit along with your hassle-free service.",
    },
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#2e057f] mb-4">Why Choose SolaceBuddy?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your trusted partner for finding the perfect bachelor accommodation with unmatched service and support.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Features Section */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Live Counters Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-[#2e057f] mb-2">Live Counter</h3>
              <p className="text-gray-600">Real-time statistics of our growing community</p>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading counters...</p>
              </div>
            ) : counters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No counters available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {counters.map((counter) => (
                  <div
                    key={counter._id}
                    className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl"
                  >
                    <div className="flex justify-center mb-3">{getIcon(counter.icon)}</div>
                    <div className="text-3xl font-bold text-[#2e057f] mb-1">
                      +{(animatedCounters[counter._id] || 0).toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-gray-600">{counter.label || "Counter"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
