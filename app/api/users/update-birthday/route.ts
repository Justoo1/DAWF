import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { dateOfBirth } = body

    if (!dateOfBirth) {
      return NextResponse.json(
        { message: "Date of birth is required" },
        { status: 400 }
      )
    }

    // Update user's birthday
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dateOfBirth: new Date(dateOfBirth),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(
      { message: "Birthday updated successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating birthday:", error)
    return NextResponse.json(
      { message: "Failed to update birthday" },
      { status: 500 }
    )
  }
}
