import { NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { FeaturedProductModel } from "@/lib/backend/models/featuredProduct.model";
import { ProductSKU } from "@/lib/backend/models/productSKU.model";

export async function GET() {
  try {
    await connectDB();
    // Populate the product details
    const featured = await FeaturedProductModel.find({ P01_deleted_at: null })
      .populate({
        path: "P01_M06_product_id",
        model: ProductSKU,
      })
      .sort({ P01_order: 1 });

    return NextResponse.json({ success: true, data: featured }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
    }

    // Check if already featured
    const existing = await FeaturedProductModel.findOne({ P01_M06_product_id: product_id, P01_deleted_at: null });
    if (existing) {
      return NextResponse.json({ success: false, message: "Product is already featured" }, { status: 400 });
    }

    // Get highest order
    const lastFeatured = await FeaturedProductModel.findOne().sort({ P01_order: -1 });
    const nextOrder = lastFeatured ? lastFeatured.P01_order + 1 : 1;

    const newFeatured = await FeaturedProductModel.create({
      P01_M06_product_id: product_id,
      P01_order: nextOrder
    });

    return NextResponse.json({ success: true, message: "Product added to featured list", data: newFeatured }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
