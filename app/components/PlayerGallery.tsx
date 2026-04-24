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

      <div className="flex gap-3 justify-end mt-4">
        {displayImages.map((img, i) => (
          <Image
            key={i}
            src={img}
            width={70}
            height={70}
            alt="thumb"
            onClick={() => setActive(img)}
            className={`cursor-pointer rounded-lg object-cover transition ${
              active === img
                ? "ring-2 ring-yellow-400"
                : "opacity-80 hover:opacity-100"
            }`}
            unoptimized
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/b2.jpg";
            }}
          />
        ))}
      </div>
    </div>
  );
}
