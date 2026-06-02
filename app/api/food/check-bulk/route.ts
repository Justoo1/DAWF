import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const names: string[] = body?.names ?? [];

    if (!Array.isArray(names) || names.length === 0) {
      return NextResponse.json({ existing: [], newNames: [] });
    }

    const trimmed = names.map((n) => String(n).trim()).filter(Boolean);

    const matches = await prisma.food.findMany({
      where: { name: { in: trimmed, mode: "insensitive" } },
      select: { name: true },
    });

    const existingSet = new Set(matches.map((m) => m.name.toLowerCase()));
    const existing = trimmed.filter((n) => existingSet.has(n.toLowerCase()));
    const newNames = trimmed.filter((n) => !existingSet.has(n.toLowerCase()));

    return NextResponse.json({ existing, newNames });
  } catch {
    return NextResponse.json({ error: "Failed to check foods" }, { status: 500 });
  }
}
