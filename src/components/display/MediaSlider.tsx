'use client';

import React, { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface SliderImage {
  id: string;
  image_url: string;
  order_index?: number;
}

interface MediaSliderProps {
  images: SliderImage[];
}

export default function MediaSlider({ images }: MediaSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: false });

  useEffect(() => {
    if (!emblaApi || images.length <= 1) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000); // Autoplay every 5 seconds

    return () => clearInterval(autoplay);
  }, [emblaApi, images]);

  if (images.length === 0) {
    return (
      <div className="w-full h-full glass-panel rounded-3xl flex items-center justify-center border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xs" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1597935258735-e254c1839512?auto=format&fit=crop&q=80&w=1200')" }} />
        <div className="relative text-center p-6">
          <p className="text-emerald-400 font-semibold tracking-wider text-xl uppercase">Masjid Gino Sugiono</p>
          <p className="text-slate-400 mt-2 text-sm max-w-md">Menghidupkan syiar Islam, menebar kedamaian, dan mempererat ukhuwah islamiyah.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl glass-panel">
      {/* Carousel container */}
      <div className="embla overflow-hidden h-full w-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {images.map((img) => (
            <div key={img.id} className="embla__slide flex-[0_0_100%] min-w-0 h-full relative">
              {/* Background gradient fade-over to make text/overlay stand out */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50 z-10" />
              
              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.image_url}
                alt="Masjid Activity"
                className="w-full h-full object-cover transition-transform duration-1000 ease-out hover:scale-105"
                loading="eager"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Branding Watermark */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/20">
          INFORMASI & DOKUMENTASI
        </span>
      </div>
    </div>
  );
}
