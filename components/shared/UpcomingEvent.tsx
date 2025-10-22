"use client"

import React from 'react'
import { Manrope } from 'next/font/google';
import { cn, formatDateParts } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import Autoplay from "embla-carousel-autoplay"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const manrope = Manrope({ 
    subsets: ["latin"], 
    weight: ["200","300", "400", "500", "600", "700"]
  })

interface Event {
  id: string;
  type: string;
  title: string;
  start: Date;
  end: Date;
  description: string | null;
  location: string | null;
}

interface UpcomingEventProps {
  upcomingEvents: Event[];
  success: boolean | undefined
}

const UpcomingEvent = ({upcomingEvents, success}: UpcomingEventProps) => {
  return (
    <div className={cn("relative group overflow-hidden rounded-lg bg-[url('/assets/images/upcomingevent.svg')] bg-cover bg-center justify-center items-center flex w-[311px] h-[450px] lg:w-full lg:max-w-[311px] lg:h-auto lg:aspect-[311/450]", manrope.className)}>
      {success && upcomingEvents.length > 0 ? (
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 6000,
            }),
          ]}
          className="w-full max-w-sm md:max-w-2xl lg:max-w-4xl mx-auto"
        >
          <CarouselContent>
            {upcomingEvents.map((event:Event, index) => {
              const {
                month,
                year,
                day,
                hour,
                minutes,
                amPm,
              } = formatDateParts(event.start)
              return (
                <CarouselItem key={index} className="flex flex-col justify-center items-center text-center space-y-6">
                  <div className="relative p-6 h-full flex flex-col justify-between">
                    <div>
                      <span className="text-gray-300 text-xs tracking-wider mb-10 block">
                        UPCOMING EVENT
                      </span>
                    </div>

                    <div className='flex flex-col justify-center items-center'>
                      <h2 className="text-white text-2xl lg:text-xl font-bold mb-4 flex-wrap uppercase">
                        {event.title}
                      </h2>
                      <div className="flex items-end gap-8 lg:gap-6 mb-2">
                        <div>
                          <span className="text-emerald-400 text-5xl lg:text-4xl tracking-[1rem] lg:tracking-[0.8rem] 2xl:text-5xl font-extrabold leading-none 2xl:tracking-[1rem]">{day}</span>
                          <span className="text-emerald-400 text-xs block tracking-widest text-center font-bold uppercase">{month}.{year}</span>
                        </div>
                        <div>
                          <span className="text-orange-500 text-5xl lg:text-4xl tracking-[1rem] lg:tracking-[0.8rem] 2xl:text-5xl font-extrabold leading-none 2xl:tracking-[1rem]">{hour}</span>
                          <span className="text-orange-500 text-xs block tracking-[0.4rem] text-center font-bold">{minutes}.{amPm}</span>
                        </div>
                      </div>

                      <span className="text-white text-xl lg:text-lg tracking-widest block mb-2 text-center uppercase">
                        {event.location}
                      </span>

                      <div className="text-center mt-14 lg:mt-8 2xl:mt-8">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="text-gray-300 text-xs hover:text-white transition-colors">
                              READ MORE...
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="grid gap-4">
                              <div className="space-y-2">
                                <h4 className="font-medium leading-none">{event.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {event.description || "No description available."}
                                </p>
                              </div>
                              <div className="grid gap-2">
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <span className="text-sm">Start:</span>
                                  <span className="col-span-2 text-sm">
                                    {event.start.toLocaleString()}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <span className="text-sm">End:</span>
                                  <span className="col-span-2 text-sm">
                                    {event.end.toLocaleString()}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <span className="text-sm">Location:</span>
                                  <span className="col-span-2 text-sm">
                                    {event.location || "Not specified"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>
          <div className="flex justify-center mt-4 gap-2">
            <CarouselPrevious className="hidden lg:flex" />
            <CarouselNext className="hidden lg:flex" />
          </div>
        </Carousel>
      ) : (
        <div className="text-center p-6 h-full flex flex-col justify-between items-center">
          <span className='text-white text-center'>No Upcoming Events</span>
        </div>
      )}
    </div>
  )
}

export default UpcomingEvent

