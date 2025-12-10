"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

interface Testimonial {
  _id: string
  name: string
  designation: string
  company: string
  rating: number
  review: string
  image: string
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials")
      const result = await response.json()
      if (result.success && result.data.length > 0) {
        setTestimonials(result.data)
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAutoPlaying || testimonials.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1))
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1))
  }

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-[#2e057f] via-[#4c1d95] to-[#6b21a8]">
        <div className="container mx-auto px-4 text-center">
          <div className="text-white text-lg">Loading testimonials...</div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-[#2e057f] via-[#4c1d95] to-[#6b21a8]">
        <div className="container mx-auto px-4 text-center">
          <div className="text-white text-lg">No testimonials available</div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-br from-[#2e057f] via-[#4c1d95] to-[#6b21a8] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-white/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white/20 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="text-8xl font-bold text-white/20 leading-none">"</div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Stories from Those Who{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              Love Us!
            </span>
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Hear what our satisfied customers have to say about their experience with SolaceBuddy
          </p>
        </div>

        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Main Testimonial Card */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl transform transition-all duration-500">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <img
                  src={testimonials[currentIndex].image || "/placeholder.svg"}
                  alt={testimonials[currentIndex].name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-[#2e057f]/20"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                {/* Star Rating */}
                <div className="flex justify-center md:justify-start mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonials[currentIndex].rating ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">"{testimonials[currentIndex].review}"</p>

                {/* Customer Info */}
                <div>
                  <h4 className="font-bold text-[#2e057f] text-xl">{testimonials[currentIndex].name}</h4>
                  <p className="text-gray-600">
                    {testimonials[currentIndex].designation} at {testimonials[currentIndex].company}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#2e057f] p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#2e057f] p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Customer Count */}
        <div className="text-center mt-12">
          <p className="text-white/80 text-lg">
            Join <span className="font-bold text-yellow-400">{testimonials.length * 1000}+</span> happy customers who
            found their perfect stay with SolaceBuddy
          </p>
        </div>
      </div>
    </section>
  )
}
