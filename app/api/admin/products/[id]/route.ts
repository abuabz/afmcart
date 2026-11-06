import { NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { Product } from "@/lib/backend/models/product.model";
import { ProductSKU } from "@/lib/backend/models/productSKU.model";
import { ProductSKUImage } from "@/lib/backend/models/productSKUimage.model";
import { deleteUnusedUploads } from "@/lib/backend/uploads";
import {
  VariantError,
  assertVariantsAllowed,
  clearSkuVariants,
  normalizeVariants,
  setSkuVariants,
} from "@/lib/backend/products/variants";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
      variants
    } = body;

    const skuRecord = await ProductSKU.findById(params.id);
    if (!skuRecord) return NextResponse.json({ success: false, message: "SKU not found" }, { status: 404 });

    const attrs = variants === undefined ? null : normalizeVariants(variants);
    if (attrs) await assertVariantsAllowed(skuRecord.M06_M05_product_id, attrs, params.id);

    const thumbnail_image = gallery && gallery.length > 0 ? gallery[0] : null;

    // 1. Update SKU
    await ProductSKU.findByIdAndUpdate(params.id, {
      M06_sku: sku,
      M06_product_sku_name: product_name,
      M06_description: description,
      M06_thumbnail_image: thumbnail_image,
      M06_specs: specs ? JSON.stringify(specs) : "", // Store specs as JSON string
      M06_features: features ? JSON.stringify(features) : "", // Store features as JSON string
      M06_MRP: Number(mrp),
      M06_price: Number(price),
      M06_quantity: Number(quantity)
    });

    // 2. Update base Product
    if (skuRecord.M06_M05_product_id) {
      await Product.findByIdAndUpdate(skuRecord.M06_M05_product_id, {
        M05_product_name: product_name,
        M05_image: thumbnail_image,
        M05_M04_product_category: category_id
      });
    }

    // 3. Update Gallery (Delete existing ones and insert new ones)
    const oldImages = ((await ProductSKUImage.find({ M07_M06_product_sku_id: params.id } as any).lean()) as any[]).map((i) => i.M07_image_path);
    await ProductSKUImage.deleteMany({ M07_M06_product_sku_id: params.id } as any);
    if (gallery && gallery.length > 0) {
      const imageDocs = gallery.map((imgPath: string, index: number) => ({
        M07_image_path: imgPath,
        M07_M06_product_sku_id: params.id,
        M07_order: index,
        M07_is_active: 1
      }));
      await ProductSKUImage.insertMany(imageDocs);
    }
    if (attrs) await setSkuVariants(skuRecord.M06_M05_product_id, params.id, attrs);
    await deleteUnusedUploads([...oldImages, skuRecord.M06_thumbnail_image]);

    return NextResponse.json({ success: true, message: "Product updated successfully" });
  } catch (error: any) {
    const status = error instanceof VariantError ? 400 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    // Soft delete SKU
    const deletedSKU = await ProductSKU.findByIdAndUpdate(
      params.id,
      { M06_deleted_at: new Date() },
      { returnDocument: "after" }
    );

    if (!deletedSKU) return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });

    // Soft delete base Product only when no other version of it is left
    if (deletedSKU.M06_M05_product_id) {
      await clearSkuVariants(deletedSKU.M06_M05_product_id, params.id);
      const remaining = await ProductSKU.countDocuments({
        M06_M05_product_id: deletedSKU.M06_M05_product_id,
        M06_deleted_at: null,
      } as any);
      if (remaining === 0) {
        await Product.findByIdAndUpdate(
          deletedSKU.M06_M05_product_id,
          { M05_deleted_at: new Date() }
        );
      }
    }

    // Images belong to the deleted product, so remove their rows and files
    const images = (await ProductSKUImage.find({ M07_M06_product_sku_id: params.id } as any).lean()) as any[];
    await ProductSKUImage.deleteMany({ M07_M06_product_sku_id: params.id } as any);
    await deleteUnusedUploads([...images.map((i) => i.M07_image_path), deletedSKU.M06_thumbnail_image]);

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
