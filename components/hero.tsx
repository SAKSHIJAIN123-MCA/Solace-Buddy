"use client"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

interface IHeroSlide {
  _id: string
  title: string
  subtitle?: string
  description?: string
  image: string
  link?: string
  buttonText?: string
  isActive: boolean
  order: number
}

const defaultSlides = [
  {
    _id: "default1",
    title: "Welcome to Our Store",
    subtitle: "",
    description: "",
    image: "/hero-banner_banna.webp",
    link: "",
    buttonText: "",
    isActive: true,
    order: 1,
  },
  {
    _id: "default2",
    title: "Special Offers",
    subtitle: "",
    description: "",
    image: "/hero-banner_banna.webp",
    link: "",
    buttonText: "",
    isActive: true,
    order: 2,
  },
  {
    _id: "default3",
    title: "New Arrivals",
    subtitle: "",
    description: "",
    image: "/hero-banner_banna.webp",
    link: "",
    buttonText: "",
    isActive: true,
    order: 3,
  },
]

export default function Hero() {
  const [slides, setSlides] = useState<IHeroSlide[]>(defaultSlides)
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      const res = await fetch("/api/hero", { cache: "no-store" })
      const data = await res.json()
      if (Array.isArray(data.slides) && data.slides.length > 0) {
        setSlides(data.slides)
      } else {
        setSlides(defaultSlides)
      }
    } catch (error) {
      console.error("Failed to fetch hero slides:", error)
      setSlides(defaultSlides)
    }
  }

  const handleImageError = (slideId: string) => {
    setImageErrors((prev) => ({ ...prev, [slideId]: true }))
  }

  const getImageSrc = (slide: IHeroSlide) => {
    if (imageErrors[slide._id]) {
      return `/placeholder.svg?height=500&width=800&text=${encodeURIComponent(slide.title)}`
    }
    return slide.image || `/placeholder.svg?height=500&width=800&text=${encodeURIComponent(slide.title)}`
  }

  return (
    <div className="w-full bg-white">
      <div className="w-full h-[500px]">
        <div className="mx-auto  py-0">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            loop={slides.length > 1}
            className="overflow-hidden"
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide._id}>
                {slide.link ? (
                  <Link href={slide.link}>
                    <div className="relative w-full h-[500px] group cursor-pointer bg-gray-100">
                      <Image
                        src={getImageSrc(slide) || "/placeholder.svg"}
                        alt={slide.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                        priority
                        onError={() => handleImageError(slide._id)}
                      />
                      <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                    </div>
                  </Link>
                ) : (
                  <div className="relative w-full h-[500px] bg-gray-100">
                    <Image
                      src={getImageSrc(slide) || "/placeholder.svg"}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      unoptimized
                      priority
                      onError={() => handleImageError(slide._id)}
                    />
                    {imageErrors[slide._id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-white-500 to-purple-600 text-white">
                        <div className="text-center">
                          <h3 className="text-xl font-bold">{slide.title}</h3>
                          {slide.subtitle && <p className="text-sm opacity-90">{slide.subtitle}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  )
}
