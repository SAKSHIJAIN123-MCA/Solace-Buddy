import HeroSection from "@/components/vendor-central/hero-section"
import PackagesSection from "@/components/vendor-central/packages-section"
import FaqSection from "@/components/vendor-central/faq-section"


export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <PackagesSection />
      <FaqSection />
     
    </main>
  )
}
