"use client";

import { useState, useRef, useEffect } from "react";
import { UserValues } from "@/lib/validation";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface UserAvatarHoverProps {
  user: UserValues;
  initials: string;
}

export function UserAvatarHover({ user, initials }: UserAvatarHoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Calculate exact center coordinates of the current avatar to position the popup there
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.left + rect.width / 2,
      });
    }

    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // 50ms debounce prevents flickering when transitioning from trigger to enlarged card
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 50);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center cursor-pointer"
    >
      {/* Trigger Area - The Small Table Avatar */}
      <div
        ref={triggerRef}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-slate-100 text-xs font-bold text-slate-600 transition-all duration-300",
          isOpen ? "border-primary opacity-0 scale-95" : "border-slate-200 hover:border-primary/50"
        )}
      >
        {initials}
      </div>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] pointer-events-none">
          {/* Backdrop Portal (fixed screen dimmer) */}
          <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-[2px] animate-in fade-in duration-200" />

          {/* Enlarged Image Overlay (Portaled so it breaks out of table overflow) */}
          <div 
            className="absolute z-50 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-slate-100 shadow-2xl text-4xl font-bold text-slate-700 ring-4 ring-primary/10 pointer-events-auto animate-in zoom-in-75 fade-in duration-200"
            style={{ top: coords.top, left: coords.left }}
          >
            {initials}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
