"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface HeroImage {
  url: string;
  alt?: string | null;
}

/**
 * Auto-flowing first-screen carousel. Cross-fades through the admin-uploaded
 * hero photos with a slow zoom for a smooth "flowing" feel. Falls back to a
 * single static image when only one is provided.
 */
export function HeroCarousel({ images, interval = 4500 }: { images: HeroImage[]; interval?: number }) {
  const [idx, setIdx] = useState(0);
  const count = images.length;

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % count), interval);
    return () => window.clearInterval(id);
  }, [count, interval]);

  if (count === 0) return null;

  return (
    <>
      {images.map((img, i) => (
        <div
          key={img.url + i}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== idx}
        >
          <Image
            src={img.url}
            alt={img.alt ?? "Apt.Bed"}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 40vw"
            unoptimized
            className={`object-cover transition-transform duration-[6000ms] ease-out ${
              i === idx ? "scale-105" : "scale-100"
            }`}
          />
        </div>
      ))}

      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Show photo ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === idx ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
