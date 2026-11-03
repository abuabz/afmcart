import { NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { ProductSKU } from "@/lib/backend/models/productSKU.model";
import { Product } from "@/lib/backend/models/product.model";
import { getVariantLabels } from "@/lib/backend/products/variants";

function cleanUrl(url?: string | null): string {
  if (!url) return "";
  return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, "");
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || searchParams.get("categoryID");
    const search = searchParams.get("search")?.trim();

    const query: Record<string, any> = { M06_deleted_at: null };

    if (categoryId) {
      const categoryProducts = await Product.find({
        M05_M04_product_category: categoryId,
        M05_deleted_at: null,
      }).select("_id").lean();
      query.M06_M05_product_id = { $in: categoryProducts.map((product) => product._id) };
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escapedSearch, "i");
      const matchingProducts = await Product.find({
        M05_product_name: searchRegex,
        M05_deleted_at: null,
        ...(categoryId ? { M05_M04_product_category: categoryId } : {}),
      }).select("_id").lean();
      const searchProductIds = matchingProducts.map((product) => product._id);
      const productFilter = query.M06_M05_product_id;

      query.$or = [
        { M06_product_sku_name: searchRegex },
        { M06_description: searchRegex },
        {
          M06_M05_product_id: productFilter
            ? { $in: searchProductIds.filter((id) => productFilter.$in.some((allowedId: unknown) => String(allowedId) === String(id))) }
            : { $in: searchProductIds },
        },
      ];
    }

    const products = await ProductSKU.find(query).populate("M06_M05_product_id").lean();

    const labels = await getVariantLabels(
      products.map((p: any) => ({ _id: p._id, productId: p.M06_M05_product_id?._id ?? p.M06_M05_product_id }))
    );
    const cleanedProducts = products.map((prod: any) => ({
      ...prod,
      M06_thumbnail_image: cleanUrl(prod.M06_thumbnail_image),
      variant_label: labels.get(String(prod._id))?.label || "",
      variant_missing: labels.get(String(prod._id))?.missing || false
    }));

    return NextResponse.json({
      success: true,
      msg: "Products fetched successfully",
      data: {
        products_skus: cleanedProducts,
        pagination: {
          page: 1,
          limit: 32,
          totalItems: cleanedProducts.length,
          totalPages: 1
        }
      },
      statusCode: 200
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, msg: error.message }, { status: 500 });
  }
}
