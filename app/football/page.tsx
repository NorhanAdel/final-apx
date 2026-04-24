"use client";

import { useTheme } from "../context/ThemeContext";

import PositionSection from "../components/PositionSection";
import EventsSection from "../components/EventsSection";
import NewestPlayers from "../components/NewestPlayers";
import TransfersSection from "../components/TransfersSection";
import PlayersSlider from "../components/PlayersSlider";

export default function MainHome() {
  const { theme } = useTheme();

  return (
    <main
      className={`px-2 lg:px-20 transition
      ${theme === "dark" ? "bg-[#020617]" : "bg-gray-100"}`}
    >
      <PlayersSlider />
      <PositionSection />
      <EventsSection />
      <NewestPlayers />
      <TransfersSection />
    </main>
  );
}