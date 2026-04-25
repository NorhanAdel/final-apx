"use client";

import { useTheme } from "../context/ThemeContext";

import PositionSection from "../components/PositionSection";
import EventsSection from "../components/EventsSection";
import NewestPlayers from "../components/NewestPlayers";
import TransfersSection from "../components/TransfersSection";
import AdsSlider from "../components/AdsSlider";

export default function MainHome() {
  const { theme } = useTheme();

  return (
    <main
      className={`px-2 lg:px-20 transition pt-30
      ${theme === "dark" ? "bg-[#020617]" : "bg-gray-100"}`}
    >
      <AdsSlider />
      <PositionSection />
      <EventsSection />
      <NewestPlayers />
      <TransfersSection />
    </main>
  );
}