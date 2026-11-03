import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/backend/db";
import { StoreSettings } from "@/lib/backend/models/storeSettings.model";
import { getStorefrontSettings } from "@/lib/backend/storefront/settings";

const settingsInput = z.object({ whatsappNotificationsEnabled: z.boolean() });

export async function GET() {
  try {
    await connectDB();
    const settings = await getStorefrontSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch {
    return NextResponse.json({ success: false, message: "Settings are unavailable." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const parsed = settingsInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid settings." }, { status: 400 });
  }

  try {
    await connectDB();
    const settings = await StoreSettings.findOneAndUpdate(
      { key: "storefront" },
      { $set: parsed.data, $setOnInsert: { key: "storefront" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    return NextResponse.json({ success: true, data: settings });
  } catch {
    return NextResponse.json({ success: false, message: "Could not save settings." }, { status: 500 });
  }
}