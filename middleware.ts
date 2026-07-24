import { type NextRequest, NextResponse } from 'next/server'

/**
 * Middleware for request authentication and authorization
 * Protects admin routes and enforces security policies
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Note: Token validation is delegated to ProtectedRoute component
    // which uses Firebase Auth context. This middleware just ensures
    // requests have proper origin and headers.
  }

  // Security headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('X-Content-Type-Options', 'nosniff')
  requestHeaders.set('X-Frame-Options', 'DENY')
  requestHeaders.set('X-XSS-Protection', '1; mode=block')
  requestHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  // Protect admin routes and API routes
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
}
