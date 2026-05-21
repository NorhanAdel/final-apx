"use client";

import { useTheme } from "../context/ThemeContext";
import { useParams } from "next/navigation";

import EventsSection from "../components/EventsSection";
import NewestPlayers from "../components/NewestPlayers";
import TransfersSection from "../components/TransfersSection";
import AdsSlider from "../components/AdsSlider";
import PositionSlider from "./PositionSection";
import Investor from "./Investor";
import SponsoredAds from "./SponsoredAds";

export default function MainHome() {
  const { theme } = useTheme();
  const params = useParams();

  const sportId = params?.sport as string;  

  return (
    <main
      className={`px-2 lg:px-20 transition pt-30 ${
        theme === "dark" ? "bg-[#020617]" : "bg-gray-100"
      }`}
    >
      <AdsSlider />

  
      <PositionSlider sportId={sportId} />

  <EventsSection sportId={sportId} />
      <NewestPlayers />
      <TransfersSection  />
      <SponsoredAds/>
      <Investor/>
       
    </main>
  );
}
