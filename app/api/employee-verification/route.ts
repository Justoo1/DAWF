import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function appOrigin(req: NextRequest) {
  return req.nextUrl.origin;
}

export async function GET(req: NextRequest) {
  const origin = appOrigin(req);
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${origin}/sign-in?error=invalid_token`);
  }

  const record = await prisma.verification.findFirst({
    where: { value: token },
    select: {
      id: true,
      identifier: true,
      expiresAt: true,
    },
  });

  if (!record) {
    return NextResponse.redirect(`${origin}/sign-in?error=invalid_token`);
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.verification.deleteMany({ where: { id: record.id } });
    return NextResponse.redirect(`${origin}/sign-in?error=token_expired`);
  }

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: record.identifier,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (!user) {
    await prisma.verification.deleteMany({ where: { id: record.id } });
    return NextResponse.redirect(`${origin}/sign-in?error=invalid_token`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });
    await tx.verification.deleteMany({
      where: {
        OR: [{ id: record.id }, { identifier: record.identifier }],
      },
    });
  });

  return NextResponse.redirect(`${origin}/sign-in?verified=1`);
}

