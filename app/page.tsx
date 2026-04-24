"use client";

import About from "./components/About";
import ContactSection from "./components/ContactSection";
import CustomSlider from "./components/CustomSlider";
import Hero from "./components/Hero";
import MissionVisionSlide from "./components/MissionVisionSlide";
import SportsSection from "./components/SportsSection";
import useTranslate from "./hooks/useTranslate";

export default function Home() {
  const { lang } = useTranslate();

  return (
    <div>
      <Hero lang={lang} />
      <SportsSection lang={lang} />
      <About lang={lang} />

      <MissionVisionSlide />

      <CustomSlider lang={lang} />  

      <ContactSection />
    </div>
  );
}