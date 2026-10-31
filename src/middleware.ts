import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const LOCAL_HOST_PATTERNS = [
  /^localhost(?::\d+)?$/i,
  /^127\.0\.0\.1(?::\d+)?$/,
  /^\[::1\](?::\d+)?$/,
]

export function middleware(request: NextRequest) {
  // Only guard API routes
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  const host = request.headers.get("host") || ""
  const isLocalHost = LOCAL_HOST_PATTERNS.some((pattern) => pattern.test(host))

  // 1. Host Validation (Loopback & Zero-Trust Boundary)
  if (!isLocalHost && process.env.NODE_ENV !== "development") {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error:
          "Forbidden: DefenX API is restricted to local loopback interface (Zero-Trust Boundary)",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  // 2. CSRF & DNS Rebinding Origin Protection for State-Mutating Requests
  const method = request.method.toUpperCase()
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    const origin = request.headers.get("origin")
    const referer = request.headers.get("referer")

    if (origin) {
      try {
        const originUrl = new URL(origin)
        const isLocalOrigin = LOCAL_HOST_PATTERNS.some((p) =>
          p.test(originUrl.host),
        )
        if (!isLocalOrigin) {
          return new NextResponse(
            JSON.stringify({
              success: false,
              error:
                "Forbidden: Untrusted cross-origin request blocked by DefenX Zero-Trust Guard",
            }),
            {
              status: 403,
              headers: { "Content-Type": "application/json" },
            },
          )
        }
      } catch {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: "Invalid Origin header format",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        )
      }
    } else if (referer) {
      try {
        const refererUrl = new URL(referer)
        const isLocalReferer = LOCAL_HOST_PATTERNS.some((p) =>
          p.test(refererUrl.host),
        )
        if (!isLocalReferer) {
          return new NextResponse(
            JSON.stringify({
              success: false,
              error: "Forbidden: Untrusted referer header blocked",
            }),
            {
              status: 403,
              headers: { "Content-Type": "application/json" },
            },
          )
        }
      } catch { }
    }
  }

  // 3. Add Hardened Security Headers to Response
  const response = NextResponse.next()
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-DefenX-Protection", "Active-v2.0")

  return response
}

export const config = {
  matcher: ["/api/:path*"],
}
