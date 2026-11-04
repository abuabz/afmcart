import { NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { CustomerOrder } from "@/lib/backend/models/customerOrder.model";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim();
    const query: Record<string, any> = {};
    if (status && status !== "all") query.status = status;
    if (q) {
      const regex = new RegExp(escapeRegex(q), "i");
      query.$or = [
        { orderNumber: regex },
        { "customer.name": regex },
        { "customer.phone": regex },
      ];
    }
    const orders = await CustomerOrder.find(query).sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json({ success: true, data: orders }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ success: false, message: "Orders are unavailable." }, { status: 503 });
  }
}