import { NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { FeaturedProductModel } from "@/lib/backend/models/featuredProduct.model";
import { ProductSKU } from "@/lib/backend/models/productSKU.model";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    
    // Fetch featured products, populated with the SKU details
    const featured = await FeaturedProductModel.find({ P01_deleted_at: null })
      .populate({
        path: "P01_M06_product_id",
        model: ProductSKU,
      })
      .sort({ P01_order: 1 });

    // The frontend expects the array inside data.products_skus
    // So we map the featured array to extract just the populated SKU document
    const skus = featured
      .map(f => f.P01_M06_product_id)
      .filter(sku => sku !== null); // Filter out any nulls if a product was deleted but still featured

    return NextResponse.json({ 
      success: true, 
      msg: "Featured products fetched successfully",
      data: {
        products_skus: skus
      }
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, msg: error.message }, { status: 500 });
  }
}
