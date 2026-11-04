import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/backend/db";
import { CustomerOrder, customerOrderStatuses } from "@/lib/backend/models/customerOrder.model";
import { ProductSKU } from "@/lib/backend/models/productSKU.model";

const updateInput = z.object({
  status: z.enum(customerOrderStatuses),
  note: z.string().trim().max(240).optional().default(""),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
  }
  const parsed = updateInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid order status." }, { status: 400 });
  }

  try {
    await connectDB();
    const order = await CustomerOrder.findOneAndUpdate(
      { _id: id, status: { $nin: ["delivered", "cancelled"] } },
      {
        $set: { status: parsed.data.status },
        $push: { statusHistory: { status: parsed.data.status, note: parsed.data.note } },
      },
      { new: true }
    ).lean();
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found or already closed." }, { status: 404 });
    }
    if (parsed.data.status === "cancelled") {
      await Promise.all(order.items.map((item: any) =>
        ProductSKU.updateOne({ _id: item.skuId }, { $inc: { M06_quantity: item.quantity } })
      ));
    }
    return NextResponse.json({ success: true, data: order });
  } catch {
    return NextResponse.json({ success: false, message: "Could not update order status." }, { status: 500 });
  }
}