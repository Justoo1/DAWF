"use client";

import { DawfRoomBookingForm } from "@/components/dawf/DawfRoomBookingForm";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConferenceRoomValues } from "@/lib/validation";
import { formatDateTime } from "@/lib/utils";
import { DoorOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const BOOK_HASH = "book-room";

export type DawfRecentBooking = {
  id: string;
  title: string;
  status: string;
  startIso: string;
  endIso: string;
  roomName: string;
};

function stripBookHash() {
  if (typeof window === "undefined") return;
  const raw = window.location.hash.replace(/^#/, "");
  if (raw === BOOK_HASH || raw.startsWith(`${BOOK_HASH}/`)) {
    const path = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", path);
  }
}

function hashOpensModal(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.location.hash.replace(/^#/, "");
  return raw === BOOK_HASH || raw.startsWith(`${BOOK_HASH}/`);
}

export function DawfRoomBookingModal({
  userId,
  rooms,
  recentBookings,
}: {
  userId: string;
  rooms: ConferenceRoomValues[];
  recentBookings: DawfRecentBooking[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const syncOpenFromHash = useCallback(() => {
    if (hashOpensModal()) setOpen(true);
  }, []);

  useEffect(() => {
    syncOpenFromHash();
    const id = window.requestAnimationFrame(() => syncOpenFromHash());
    window.addEventListener("hashchange", syncOpenFromHash);
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener("hashchange", syncOpenFromHash);
    };
  }, [pathname, syncOpenFromHash]);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) stripBookHash();
  };

  const openModal = () => setOpen(true);

  const roomCount = rooms.length;
  const teaserBookings = recentBookings.slice(0, 2);

  if (roomCount === 0) {
    return (
      <Card className="rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-muted p-3">
            <DoorOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
              Room booking
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              No active conference rooms are set up yet. Please contact an administrator.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Card
        role="button"
        tabIndex={0}
        onClick={openModal}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openModal();
          }
        }}
        className="cursor-pointer rounded-2xl border border-border bg-card p-6 shadow-lg outline-none transition-colors hover:border-emerald-500/40 hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-emerald-500/10 p-3">
            <DoorOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
              Room booking
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {roomCount} room{roomCount === 1 ? "" : "s"} available. Open to choose a room, check
              free slots, and submit a request.
            </p>
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              Tip: use the sidebar shortcut or this card — same experience.
            </p>
            {teaserBookings.length > 0 ? (
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {teaserBookings.map((b) => (
                  <li key={b.id}>
                    <span className="font-medium text-foreground">{b.title}</span>
                    {" · "}
                    {b.roomName}
                    {" · "}
                    <span className="uppercase">{b.status}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </Card>

      <DialogContent className="max-h-[min(90vh,900px)] w-full max-w-3xl translate-y-[-48%] overflow-y-auto sm:translate-y-[-50%]">
        <DialogHeader>
          <DialogTitle>Book a conference room</DialogTitle>
          <DialogDescription>
            Pick a room and date, load availability for that room, choose a free time slot, then
            submit. Approvers will be notified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          <DawfRoomBookingForm userId={userId} rooms={rooms} />

          <div>
            <h3 className="mb-3 text-sm font-bold text-foreground">My recent bookings</h3>
            {recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            ) : (
              <ul className="max-h-40 space-y-2 overflow-y-auto text-sm">
                {recentBookings.map((booking) => (
                  <li
                    key={booking.id}
                    className="rounded-md border border-border bg-muted/20 px-3 py-2 dark:bg-muted/10"
                  >
                    <p className="font-medium text-foreground">{booking.title}</p>
                    <p className="text-muted-foreground">{booking.roomName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(new Date(booking.startIso)).dateTime} —{" "}
                      {formatDateTime(new Date(booking.endIso)).dateTime}
                    </p>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      {booking.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
