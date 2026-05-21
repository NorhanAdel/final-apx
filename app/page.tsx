"use client";

import About from "./components/About";
import ContactSection from "./components/ContactSection";
import CustomSlider from "./components/CustomSlider";
import Hero from "./components/Hero";
import MissionVisionSlide from "./components/MissionVisionSlide";
import SportsSection from "./components/SportsSection";
import SidebarAds from "./components/SidebarAds";  
import useTranslate from "./hooks/useTranslate";
import SponsoredAds from "./components/SponsoredAds"
export default function Home() {
  const { lang } = useTranslate();

  return (
    <div className="relative">
      
     
       

      <Hero />
      <SportsSection lang={lang} />
      <About lang={lang} />
    <SponsoredAds/>
      <MissionVisionSlide />

      <CustomSlider lang={lang} />

      <ContactSection />
    </div>
  );
}
