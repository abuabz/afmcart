import { NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { ProductSKU } from "@/lib/backend/models/productSKU.model";
import { ProductSKUImage } from "@/lib/backend/models/productSKUimage.model";
import { Product } from "@/lib/backend/models/product.model";

function cleanUrl(url?: string | null): string {
  if (!url) return "";
  return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, "");
}

type Props = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(request: Request, { params }: Props) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const sku = await ProductSKU.findById(resolvedParams.id).lean();

    if (!sku) {
      return NextResponse.json({ success: false, msg: "Product not found", statusCode: 404 }, { status: 404 });
    }

    const [rawImages, baseProduct] = await Promise.all([
      ProductSKUImage.find({ M07_M06_product_sku_id: resolvedParams.id, M07_deleted_at: null }).sort({ M07_order: 1 }).lean(),
      Product.findById(sku.M06_M05_product_id).lean(),
    ]);
    const images = rawImages.map(img => ({
      ...img,
      M07_image_path: cleanUrl(img.M07_image_path)
    }));

    // Parse Specs
    let parsedSpecs = [];
    if (sku.M06_specs) {
      try {
        parsedSpecs = JSON.parse(sku.M06_specs as string);
      } catch (e) {
        console.error("Failed to parse specs", e);
      }
    }

    // Parse Features
    let parsedFeatures = [];
    if (sku.M06_features) {
      try {
        parsedFeatures = JSON.parse(sku.M06_features as string);
      } catch (e) {
        console.error("Failed to parse features", e);
      }
    }

    const cleanedThumbnail = cleanUrl(sku.M06_thumbnail_image);
    // Format for frontend
    const productData = {
      ...sku,
      category_id: baseProduct?.M05_M04_product_category ? String(baseProduct.M05_M04_product_category) : "",
      M06_thumbnail_image: cleanedThumbnail,
      M06_features: parsedFeatures,
      M06_specs: parsedSpecs,
      Images: images.length > 0 ? images : (cleanedThumbnail ? [{ M07_image_path: cleanedThumbnail }] : []),
      Variations: [],
      M06_is_out_of_stock: sku.M06_quantity <= 0
    };

    return NextResponse.json({
      success: true,
      msg: "Product fetched successfully",
      data: productData,
      statusCode: 200
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, msg: error.message, statusCode: 500 }, { status: 500 });
  }
}
