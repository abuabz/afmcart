import { NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { Product } from "@/lib/backend/models/product.model";
import { ProductSKU } from "@/lib/backend/models/productSKU.model";
import { ProductSKUImage } from "@/lib/backend/models/productSKUimage.model";
import {
  VariantError,
  assertVariantsAllowed,
  normalizeVariants,
  setSkuVariants,
} from "@/lib/backend/products/variants";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { 
      product_name, 
      category_id, 
      sku, 
      description, 
      gallery,
      specs,
      features,
      mrp, 
      price, 
      quantity,
      parent_product_id,
      variants
    } = body;

    if (!product_name || !sku || !price || (!category_id && !parent_product_id)) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const attrs = normalizeVariants(variants);
    let product: any = null;
    if (parent_product_id) {
      product = await Product.findOne({ _id: parent_product_id, M05_deleted_at: null } as any);
      if (!product) {
        return NextResponse.json({ success: false, message: "Parent product not found" }, { status: 404 });
      }
      if (attrs.length === 0) {
        return NextResponse.json({ success: false, message: "Add at least one variant option (e.g. Color = Red)" }, { status: 400 });
      }
      await assertVariantsAllowed(product._id, attrs);
    }

    const thumbnail_image = gallery && gallery.length > 0 ? gallery[0] : null;

    // 1. Create the base Product, unless this is another version of an existing one
    const createdProduct = !product;
    if (!product) {
      product = await Product.create({
        M05_product_name: product_name,
        M05_image: thumbnail_image,
        M05_M04_product_category: category_id,
        M05_is_active: 1
      });
    }

    // 2. Create the Product SKU
    let newSKU;
    try {
      newSKU = await ProductSKU.create({
        M06_sku: sku,
        M06_product_sku_name: product_name,
        M06_description: description || "",
        M06_thumbnail_image: thumbnail_image,
        M06_specs: specs ? JSON.stringify(specs) : "", // Store specs as JSON string
        M06_features: features ? JSON.stringify(features) : "", // Store features as JSON string
        M06_MRP: Number(mrp) || Number(price),
        M06_price: Number(price),
        M06_quantity: Number(quantity) || 0,
        M06_is_new: true,
        M06_is_active: 1,
        M06_M05_product_id: product._id
      });
    } catch (err) {
      if (createdProduct) await Product.findByIdAndDelete(product._id);
      throw err;
    }

    if (attrs.length > 0) await setSkuVariants(product._id, newSKU._id, attrs);

    // 3. Create the ProductSKUImage records
    if (gallery && gallery.length > 0) {
      const imageDocs = gallery.map((imgPath: string, index: number) => ({
        M07_image_path: imgPath,
        M07_M06_product_sku_id: newSKU._id,
        M07_order: index,
        M07_is_active: 1
      }));
      await ProductSKUImage.insertMany(imageDocs);
    }

    return NextResponse.json({ success: true, message: "Product created successfully", data: newSKU }, { status: 201 });
  } catch (error: any) {
    const status = error instanceof VariantError ? 400 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}
