"use client";

import BookingForm from "@/components/shared/BookingForm";
import { ConferenceRoomValues } from "@/lib/validation";
import { useRouter } from "next/navigation";

export function HomeRoomBookingForm({
  userId,
  rooms,
}: {
  userId: string;
  rooms: ConferenceRoomValues[];
}) {
  const router = useRouter();
  return (
    <BookingForm
      userId={userId}
      rooms={rooms}
      onSuccess={() => router.refresh()}
    />
  );
}
