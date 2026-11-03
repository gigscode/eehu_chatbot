import { NextRequest, NextResponse } from 'next/server'

// In-memory rate limiter per route.
// Resets on cold start. Works for single-instance and low-traffic deployments.
// For high-traffic production use, replace with Upstash Redis or similar.

type RateRecord = { count: number; windowStart: number }
const chatLimiterMap = new Map<string, RateRecord>()
const adminLimiterMap = new Map<string, RateRecord>()

function checkRateLimit(
  map: Map<string, RateRecord>,
  ip: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const record = map.get(ip)

  if (!record || now - record.windowStart > windowMs) {
    map.set(ip, { count: 1, windowStart: now })
    return false
  }

  record.count += 1
  if (record.count > limit) return true
  return false
}

export function proxy(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1'

  if (req.nextUrl.pathname === '/api/chat') {
    if (checkRateLimit(chatLimiterMap, ip, 20, 60_000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before sending another message.' },
        { status: 429, headers: { 'Cache-Control': 'no-store' } }
      )
    }
  }

  if (req.nextUrl.pathname === '/api/admin/conversations') {
    // 10 requests per minute for admin to prevent brute forcing
    if (checkRateLimit(adminLimiterMap, ip, 10, 60_000)) {
      return NextResponse.json(
        { error: 'Too many admin requests. Please wait a minute.' },
        { status: 429, headers: { 'Cache-Control': 'no-store' } }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/chat', '/api/admin/conversations'],
}
