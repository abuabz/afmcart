import { NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { ProductSKU } from "@/lib/backend/models/productSKU.model";

export async function GET() {
  try {
    await connectDB();
    const products = await ProductSKU.find({ M06_deleted_at: null }).limit(10);
    return NextResponse.json({
      success: true,
      msg: "Products fetched successfully",
      data: products,
      statusCode: 200
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, msg: error.message }, { status: 500 });
  }
}
