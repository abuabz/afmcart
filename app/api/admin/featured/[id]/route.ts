import { NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { FeaturedProductModel } from "@/lib/backend/models/featuredProduct.model";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    // Hard delete for simplicity since it's just a relation table
    const deleted = await FeaturedProductModel.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Featured product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Removed from featured list" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
