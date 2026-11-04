import { NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { getStorefrontSettings } from "@/lib/backend/storefront/settings";

export async function GET() {
  try {
    await connectDB();
    const settings = await getStorefrontSettings();
    return NextResponse.json({
      success: true,
      data: { whatsappNotificationsEnabled: settings.whatsappNotificationsEnabled },
      statusCode: 200,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ success: false, message: "Store settings are unavailable" }, { status: 503 });
  }
}