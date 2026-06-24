"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";

interface Photo {
  id: string | number;
  image_url: string;
  caption?: string;
}

interface PlayerGalleryProps {
  player: {
    photos?: Photo[];
    profile_image_url?: string;
  };
}

export default function PlayerGallery({ player }: PlayerGalleryProps) {
  const BASE_URL = "http://72.62.28.146";

  const getFullUrl = (url: string) => {
    if (!url) return "/b2.jpg";
    if (url.startsWith("http")) return url;
    return `${BASE_URL}${url}`;
  };

  const displayImages = useMemo(() => {
    const images: string[] = [];

    if (player?.profile_image_url) {
      images.push(getFullUrl(player.profile_image_url));
    }

    if (player?.photos && player.photos.length > 0) {
      player.photos.forEach((p) => {
        images.push(getFullUrl(p.image_url));
      });
    }

    return images.length > 0 ? images : ["/b2.jpg"];
  }, [player]);

  const [active, setActive] = useState<string>(displayImages[0]);

  useEffect(() => {
    setActive(displayImages[0]);
  }, [displayImages]);

  return (
    <div>
      <div className="rounded-xl overflow-hidden">
        <Image
          src={active}
          width={500}
          height={600}
          alt="player"
          className="w-full object-cover"
          unoptimized
          priority
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/b2.jpg";
          }}
        />
      </div>

     <div className="
mt-5
flex
gap-3
overflow-x-auto
bg-[#09111f]
rounded-3xl
p-3
custom-scroll
border border-white/10
">
  {displayImages.map((img, i) => (
    <button
      key={i}
      onClick={() => setActive(img)}
      className={`
      flex-shrink-0
      rounded-2xl
      overflow-hidden
      transition-all
      duration-300
      border-2
      ${
        active === img
          ? "border-yellow-400 scale-105 shadow-lg shadow-yellow-500/30"
          : "border-transparent opacity-70 hover:opacity-100"
      }
    `}
    >
      <Image
        src={img}
        width={70}
        height={70}
        alt="thumb"
        className="w-[65px] h-[65px] md:w-[75px] md:h-[75px] object-cover"
        unoptimized
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/b2.jpg";
        }}
      />
    </button>
  ))}
</div>
    </div>
  );
}
