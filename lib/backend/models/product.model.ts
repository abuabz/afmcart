import mongoose, { Document, Schema } from "mongoose";
import { ProductCategory } from "./productCategory.model";

export interface IProduct extends Document {
    M05_product_name: string;
    M05_image: string|null;
    M05_M04_product_category: mongoose.Schema.Types.ObjectId;
    M05_is_active: number;
    M05_deleted_at: Date | null;
}

const ProductSchema: Schema<IProduct> = new Schema(
    {
        M05_product_name: { type: String, required: true },
        M05_image: { type: String, default:null },
        M05_M04_product_category: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "M04_product_category",
            default:null
        },
        M05_is_active: { type: Number, default: 1 },
        M05_deleted_at: { type: Date, default: null },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

ProductSchema.pre('save', async function () {
    if(this.M05_M04_product_category){
        const category = await ProductCategory.findById(this.M05_M04_product_category);
        if(!category){
            throw new Error("Category is not valid");
        }
    }
})

export const Product = mongoose.models.M05_product || mongoose.model<IProduct>("M05_product", ProductSchema);

