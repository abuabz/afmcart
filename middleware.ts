import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define protected paths
  const isProtectedUIRoute = path.startsWith("/admin") && !path.startsWith("/admin/login");
  const isProtectedAPIRoute = path.startsWith("/api/admin") && !path.startsWith("/api/admin/login") && !path.startsWith("/api/admin/logout");

  if (isProtectedUIRoute || isProtectedAPIRoute) {
    const token = request.cookies.get("admin_token")?.value;

    // If no token exists
    if (!token) {
      if (isProtectedAPIRoute) {
        return NextResponse.json({ success: false, message: "Unauthorized: No token provided" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      // Verify the JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
      await jwtVerify(token, secret);
      
      // Token is valid, allow request to proceed
      const response = NextResponse.next();
      
      // Prevent browser caching of protected admin routes
      if (isProtectedUIRoute || isProtectedAPIRoute) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
      }
      
      return response;
    } catch (error) {
      // Token is invalid or expired
      if (isProtectedAPIRoute) {
        return NextResponse.json({ success: false, message: "Unauthorized: Invalid token" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Allow all other routes to proceed normally
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (uploaded static media files)
     */
    '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
