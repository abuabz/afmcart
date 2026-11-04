import mongoose, { Document, Schema } from "mongoose";

export interface IGallery extends Document {
    M06_media_type: "image" | "video";
    M06_media_url: string;
    M06_M05_product: mongoose.Schema.Types.ObjectId;
    M06_is_active: number;
    M06_deleted_at: Date | null;
}

const GallerySchema: Schema<IGallery> = new Schema(
    {
        M06_media_type: { 
            type: String, 
            enum: ["image", "video"], 
            required: true 
        },
        M06_media_url: { 
            type: String, 
            required: true 
        },
        M06_is_active: { 
            type: Number, 
            default: 1 
        },
        M06_deleted_at: { 
            type: Date, 
            default: null 
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);


export const Gallery = mongoose.model<IGallery>("M06_gallery", GallerySchema);