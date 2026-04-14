// Middleware is intentionally a no-op: `matcher: []` means this file never runs on requests.
// Auth and profile checks run in layouts / route handlers. Re-introducing middleware would
// require keeping it Edge-safe (no Prisma) or using the Node.js middleware runtime.

import { NextResponse } from "next/server"

export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
