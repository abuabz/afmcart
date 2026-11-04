import { NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { ProductCategory } from "@/lib/backend/models/productCategory.model";

function cleanUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, "");
}

export async function GET() {
  try {
    await connectDB();
    const categories = await ProductCategory.find({ M04_deleted_at: null }).lean();
    
    const { Product } = await import("@/lib/backend/models/product.model");
    const { ProductSKU } = await import("@/lib/backend/models/productSKU.model");
    
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        // Find all base products for this category
        const products = await Product.find({ M05_M04_product_category: cat._id, M05_deleted_at: null }, '_id');
        const productIds = products.map(p => p._id);
        
        // Count all SKUs belonging to these products
        const count = await ProductSKU.countDocuments({ 
          M06_M05_product_id: { $in: productIds }, 
          M06_deleted_at: null 
        });
        
        return {
          ...cat,
          M04_image: cleanUrl(cat.M04_image),
          productCount: count
        };
      })
    );

    return NextResponse.json({
      success: true,
      msg: "Categories fetched successfully",
      data: {
        productCategories: categoriesWithCounts,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: categories.length,
          limit: 100
        }
      },
      statusCode: 200
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, msg: error.message }, { status: 500 });
  }
}
