'use client'

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { cn } from "@/lib/utils"

type Slide = {
  label: string
  /** Add an image path here once artwork exists; slides without one render a text placeholder. */
  image?: string
}

const SLIDES: Slide[] = [
  { label: "Team", image: "/assets/images/team.png" },
  { label: "Trust" },
  { label: "Care" },
  { label: "Passion" },
]

export function AuthImageCarousel({ firstImage }: { firstImage?: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ])
  const [selected, setSelected] = useState(0)

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <div className="relative h-full w-full">
      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {SLIDES.map((slide, i) => {
            const src = i === 0 && firstImage ? firstImage : slide.image
            return (
              <div key={slide.label} className="relative h-full min-w-0 flex-[0_0_100%]">
                {src ? (
                  <Image
                    src={src}
                    alt={slide.label}
                    fill
                    className="object-contain p-8"
                    sizes="400px"
                    priority={i === 0}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="select-none text-7xl font-black uppercase tracking-tighter text-primary">
                      {slide.label}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.label}
            type="button"
            aria-label={`Show ${slide.label}`}
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === selected ? "w-6 bg-primary" : "w-2 bg-zinc-300 hover:bg-zinc-400"
            )}
          />
        ))}
      </div>
    </div>
  )
}
