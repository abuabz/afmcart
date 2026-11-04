import { NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { ProductCategory } from "@/lib/backend/models/productCategory.model";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { M04_category_name, M04_image } = body;

    if (!M04_category_name) {
      return NextResponse.json({ success: false, message: "Category name is required" }, { status: 400 });
    }

    const newCategory = await ProductCategory.create({
      M04_category_name,
      M04_image: M04_image || null,
      M04_M04_parent_category_id: null,
      M04_is_active: 1
    });

    return NextResponse.json({ success: true, message: "Category created successfully", data: newCategory }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
