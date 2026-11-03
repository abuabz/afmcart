import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/backend/db";
import { CustomerOrder } from "@/lib/backend/models/customerOrder.model";
import { ProductSKU } from "@/lib/backend/models/productSKU.model";
import { getStorefrontSettings } from "@/lib/backend/storefront/settings";

const orderInput = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().regex(/^\d{10}$/, "Enter a 10-digit mobile number"),
    email: z.union([z.string().trim().email().max(160), z.literal("")]).optional().default(""),
    address: z.string().trim().min(5).max(240),
    place: z.string().trim().min(2).max(100),
    district: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    pincode: z.string().trim().regex(/^\d{6}$/),
    landmark: z.string().trim().max(160).optional().default(""),
  }),
  items: z.array(z.object({
    skuId: z.string().regex(/^[a-f\d]{24}$/i),
    quantity: z.number().int().min(1).max(20),
    options: z.array(z.object({ name: z.string().max(80), value: z.string().max(80) })).max(12).default([]),
  })).min(1).max(30),
});

export async function POST(request: Request) {
  try {
    const parsed = orderInput.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Check the delivery details and cart items." }, { status: 400 });
    }

    await connectDB();
    const { customer, items } = parsed.data;
    const skuIds = [...new Set(items.map((item) => item.skuId))];
    const skus = await ProductSKU.find({
      _id: { $in: skuIds },
      M06_is_active: 1,
      M06_deleted_at: null,
    }).lean();
    const skuById = new Map(skus.map((sku: any) => [String(sku._id), sku]));

    if (skuById.size !== skuIds.length) {
      return NextResponse.json({ success: false, message: "One or more items are no longer available." }, { status: 409 });
    }

    const requestedQuantities = new Map<string, number>();
    for (const item of items) {
      requestedQuantities.set(item.skuId, (requestedQuantities.get(item.skuId) || 0) + item.quantity);
    }
    for (const [skuId, quantity] of requestedQuantities) {
      const sku: any = skuById.get(skuId);
      if (sku.M06_is_out_of_stock || quantity > sku.M06_quantity ||
        (sku.M06_single_order_limit && quantity > sku.M06_single_order_limit)) {
        throw new Error(`INSUFFICIENT_STOCK:${sku.M06_product_sku_name}`);
      }
    }

    const lines = items.map((item) => {
      const sku: any = skuById.get(item.skuId);
      return {
        skuId: new Types.ObjectId(item.skuId),
        sku: sku.M06_sku,
        name: sku.M06_product_sku_name,
        image: sku.M06_thumbnail_image || "",
        price: sku.M06_price,
        quantity: item.quantity,
        options: item.options,
      };
    });

    const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    const deliveryCharge = subtotal > 50 ? 0 : 9.99;
    const settings = await getStorefrontSettings();
    const orderId = new Types.ObjectId();
    const orderNumber = `AFM-${randomBytes(4).toString("hex").toUpperCase()}`;

    const reserved: Array<{ skuId: string; quantity: number }> = [];
    try {
      for (const [skuId, quantity] of requestedQuantities) {
        const reservation = await ProductSKU.updateOne(
          { _id: skuId, M06_is_active: 1, M06_is_out_of_stock: { $ne: true }, M06_deleted_at: null, M06_quantity: { $gte: quantity } },
          { $inc: { M06_quantity: -quantity } }
        );
        if (reservation.modifiedCount !== 1) throw new Error("INSUFFICIENT_STOCK:Inventory changed");
        reserved.push({ skuId, quantity });
      }

      await CustomerOrder.create({
        _id: orderId,
        orderNumber,
        customer,
        items: lines,
        subtotal,
        deliveryCharge,
        total: subtotal + deliveryCharge,
        status: "placed",
        statusHistory: [{ status: "placed", note: "Order received" }],
        whatsappNotificationEnabled: settings.whatsappNotificationsEnabled,
      });
    } catch (error) {
      await Promise.all(reserved.map(({ skuId, quantity }) =>
        ProductSKU.updateOne({ _id: skuId }, { $inc: { M06_quantity: quantity } })
      ));
      throw error;
    }

    const whatsappText = encodeURIComponent(`New Afm cart order ${orderNumber} · Total ₹${(subtotal + deliveryCharge).toFixed(2)}`);
    return NextResponse.json({
      success: true,
      data: {
        orderNumber,
        status: "placed",
        total: subtotal + deliveryCharge,
        whatsappUrl: settings.whatsappNotificationsEnabled
          ? `https://wa.me/919207104571?text=${whatsappText}`
          : null,
      },
      statusCode: 201,
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK:")) {
      return NextResponse.json({ success: false, message: "An item has insufficient stock. Refresh your cart and try again." }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Unable to place the order right now." }, { status: 500 });
  }
}