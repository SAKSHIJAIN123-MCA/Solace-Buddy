"use client"

import { cn } from "@/lib/utils"

type Card = {
  label: string
  alt: string
  height: number
}

const CARDS: Card[] = [
  { label: "", alt: "Sunny beach with palm trees", height: 360 },
  { label: "", alt: "Clothes on a rack", height: 240 },
  { label: "", alt: "People dancing at a concert", height: 240 },
  { label: "", alt: "Student studying at a desk", height: 180 },
  { label: "", alt: "Professional at work", height: 220 },
  { label: "", alt: "Person jogging outdoors", height: 200 },
]

export function LifestyleStack({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto grid max-w-md grid-cols-3 items-end gap-4 sm:max-w-none", className)}>
      {/* Left tall card */}
      <LifestyleCard className="col-span-1 row-span-3 h-[360px]" {...CARDS[0]} />
      {/* Middle column */}
      <div className="col-span-1 grid grid-rows-3 gap-4">
        <LifestyleCard className="h-[240px]" {...CARDS[1]} />
        <LifestyleCard className="h-[220px]" {...CARDS[4]} />
        <div className="hidden sm:block" />
      </div>
      {/* Right column */}
      <div className="col-span-1 grid grid-rows-3 gap-4">
        <LifestyleCard className="h-[240px]" {...CARDS[2]} />
        <LifestyleCard className="h-[200px]" {...CARDS[5]} />
        <LifestyleCard className="h-[180px]" {...CARDS[3]} />
      </div>
    </div>
  )
}

function LifestyleCard({
  label,
  alt,
  className,
}: {
  label: string
  alt: string
  className?: string
  height?: number
}) {
  // Using the built-in placeholder generator per guidelines
  const src = "/diverse-friends-laughing.png"
  return (
    <figure
      className={cn("relative overflow-hidden rounded-xl border bg-white shadow-sm ring-1 ring-black/5", className)}
    >
      <img src={src || "/placeholder.svg"} alt={alt} className="h-full w-full object-cover" />
      <figcaption className="pointer-events-none absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
        {label}
      </figcaption>
    </figure>
  )
}
