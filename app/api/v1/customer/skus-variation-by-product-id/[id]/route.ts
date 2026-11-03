import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/backend/db";
import { ProductSKU } from "@/lib/backend/models/productSKU.model";
import { ProductVariationConfiguration } from "@/lib/backend/models/productVariationConfiguration.model";
import "@/lib/backend/models/productVariation.model";
import "@/lib/backend/models/productVariationOption";

type Props = { params: Promise<{ id: string }> | { id: string } };

function cleanUrl(url?: string | null): string {
  if (!url) return "";
  return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, "");
}

export async function GET(_request: Request, { params }: Props) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: true, msg: "SKU Variations fetched successfully", data: [], statusCode: 200 });
    }

    const skus = (await ProductSKU.find({ M06_M05_product_id: id, M06_deleted_at: null } as any).lean()) as any[];
    const configs = (await ProductVariationConfiguration.find({
      M10_M06_product_sku_id: { $in: skus.map((s) => s._id) },
      M10_deleted_at: null,
    })
      .populate("M10_M08_product_variation_id", "M08_name")
      .populate("M10_M09_variation_option_id", "M09_name")
      .sort({ M10_M08_product_variation_id: 1 })
      .lean()) as any[];

    const data = skus
      .map((sku) => ({
        _id: String(sku._id),
        skuId: String(sku._id),
        M06_sku: sku.M06_sku,
        M06_product_sku_name: sku.M06_product_sku_name,
        M06_thumbnail_image: cleanUrl(sku.M06_thumbnail_image),
        variations: configs
          .filter(
            (c) =>
              String(c.M10_M06_product_sku_id) === String(sku._id) &&
              c.M10_M08_product_variation_id &&
              c.M10_M09_variation_option_id
          )
          .map((c) => ({
            _id: String(c.M10_M08_product_variation_id._id),
            name: c.M10_M08_product_variation_id.M08_name,
            options: { _id: String(c.M10_M09_variation_option_id._id), name: c.M10_M09_variation_option_id.M09_name },
          })),
      }))
      .filter((s) => s.variations.length > 0);

    return NextResponse.json({ success: true, msg: "SKU Variations fetched successfully", data, statusCode: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, msg: error.message, statusCode: 500 }, { status: 500 });
  }
}
