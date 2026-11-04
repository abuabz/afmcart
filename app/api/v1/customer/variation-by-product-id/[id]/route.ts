import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/backend/db";
import { ProductVariation } from "@/lib/backend/models/productVariation.model";
import { ProductVariationOption } from "@/lib/backend/models/productVariationOption";

type Props = { params: Promise<{ id: string }> | { id: string } };

export async function GET(_request: Request, { params }: Props) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: true, msg: "Variations fetched successfully", data: [], statusCode: 200 });
    }
    const variations = (await ProductVariation.find({ M08_M05_product_id: id, M08_deleted_at: null, M08_is_active: 1 } as any)
      .sort({ _id: 1 })
      .lean()) as any[];
    const options = (await ProductVariationOption.find({ M09_M05_product_id: id, M09_deleted_at: null, M09_is_active: 1 } as any)
      .sort({ _id: 1 })
      .lean()) as any[];

    const data = variations.map((v) => ({
      ...v,
      options: options.filter((o) => String(o.M09_M08_product_variation_id) === String(v._id)),
    }));
    return NextResponse.json({ success: true, msg: "Variations fetched successfully", data, statusCode: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, msg: error.message, statusCode: 500 }, { status: 500 });
  }
}
