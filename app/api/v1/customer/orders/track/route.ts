import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/backend/db";
import { CustomerOrder } from "@/lib/backend/models/customerOrder.model";

const trackInput = z.object({
  phone: z.string().trim().regex(/^\d{10}$/),
  pincode: z.string().trim().regex(/^\d{6}$/),
});

const attempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  const now = Date.now();
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const attempt = attempts.get(ip);
  if (attempt && attempt.resetAt > now && attempt.count >= 12) {
    return NextResponse.json({ success: false, message: "Too many attempts. Try again in a minute." }, { status: 429 });
  }
  attempts.set(ip, !attempt || attempt.resetAt <= now ? { count: 1, resetAt: now + 60_000 } : { ...attempt, count: attempt.count + 1 });

  const parsed = trackInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Enter a valid 10-digit mobile number and 6-digit pincode." }, { status: 400 });
  }

  try {
    await connectDB();
    const orders = await CustomerOrder.find({
      "customer.phone": parsed.data.phone,
      "customer.pincode": parsed.data.pincode,
    }).sort({ createdAt: -1 }).limit(10)
      .select("orderNumber status statusHistory items.name items.quantity subtotal deliveryCharge total createdAt updatedAt")
      .lean();

    return NextResponse.json({
      success: true,
      data: orders.map((order: any) => ({
        orderNumber: order.orderNumber,
        status: order.status,
        statusHistory: order.statusHistory,
        items: order.items.map((item: any) => ({ name: item.name, quantity: item.quantity })),
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ success: false, message: "Order tracking is temporarily unavailable." }, { status: 503 });
  }
}