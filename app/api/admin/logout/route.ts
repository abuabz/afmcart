import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 });
  
  // Clear the HTTP-only cookie by setting its maxAge to 0
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0 // instantly expires the cookie
  });
  
  return response;
}
