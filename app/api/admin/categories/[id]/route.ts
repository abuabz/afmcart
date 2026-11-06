import { NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { ProductCategory } from "@/lib/backend/models/productCategory.model";
import { deleteUnusedUploads } from "@/lib/backend/uploads";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await request.json();
    const { M04_category_name, M04_image } = body;

    const before = await ProductCategory.findById(params.id).select("M04_image").lean();
    const updated = await ProductCategory.findByIdAndUpdate(
      params.id,
      { M04_category_name, M04_image },
      { returnDocument: "after" }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }
    if (before?.M04_image && before.M04_image !== M04_image) await deleteUnusedUploads([before.M04_image]);

    return NextResponse.json({ success: true, message: "Category updated successfully", data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    // Soft delete
    const deleted = await ProductCategory.findByIdAndUpdate(
      params.id,
      { M04_deleted_at: new Date() },
      { returnDocument: "after" }
    );

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }
    await deleteUnusedUploads([deleted.M04_image]);

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
