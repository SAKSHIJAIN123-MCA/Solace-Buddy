import { AnnouncementBar } from "@/components/announcement-bar";
import { Header } from "@/components/header";
import  Hero  from "@/components/hero";
import PopularAreas from "@/components/popular-areas";
import FeaturedProperties from "@/components/featured-properties";
import GuideToSelect from "@/components/guide-to-select";
import ConfusedToSelect from "@/components/confused-to-select";
import HowToBook from "@/components/how-to-book";
import WhyChooseSolaceBuddy from "@/components/why-choose-solacebuddy";
import PropertyForBachelors from "@/components/property-for-bachelors";
import FAQs from "@/components/faqs";
import Testimonials from "@/components/testimonials";
import Footer from "@/components/footer";
import AreaLinks from "@/components/arealinks";
import HomeTopSearchBar from "@/components/home-top-search-bar";
import WhatsappCommunityCTA from "@/components/whatsappCommunityCTA";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <HomeTopSearchBar/>
     
      <FeaturedProperties />
      <GuideToSelect />
      <ConfusedToSelect />
      <HowToBook />
      <WhyChooseSolaceBuddy />
      <PropertyForBachelors />
      <FAQs />
      <Testimonials />
       <WhatsappCommunityCTA/>
      <AreaLinks />
     
    </div>
  );
}
