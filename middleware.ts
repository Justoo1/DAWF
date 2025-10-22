// Middleware is disabled for now - birthday check is handled client-side in the root layout
// to avoid Prisma Edge Runtime incompatibility issues

import { NextResponse } from "next/server"

export function middleware() {
  // Simply pass through all requests
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
