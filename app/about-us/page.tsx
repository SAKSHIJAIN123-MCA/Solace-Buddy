
import { AboutHero } from "@/components/about/about-hero"
import { VisionMission } from "@/components/about/vm-section"
import {  WhatWeDoAndPromise } from "@/components/about/what-we-do"
import { OurPromise } from "@/components/about/promise-section"

import { CoverageSection } from "@/components/about/coverage-section"
import { FounderSection } from "@/components/about/founder-section"
import { CTASection } from "@/components/about/cta-section"
import { FeatureSection } from "@/components/about/feature-section"


export default function AboutUsPage() {
  return (
    <main className="font-sans">
      <AboutHero />
       <FounderSection />
      <VisionMission />
       <FeatureSection/>
     <WhatWeDoAndPromise/>
     
   <CoverageSection/>
     
      <CTASection />
    </main>
  )
}
