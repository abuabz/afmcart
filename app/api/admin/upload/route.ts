import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { getUploadDir, deleteUnusedUploads } from "@/lib/backend/uploads";
import { connectDB } from "@/lib/backend/db";

// Removes files uploaded in a form that was cancelled; files still referenced are kept
export async function DELETE(request: Request) {
  try {
    const { urls } = await request.json();
    if (!Array.isArray(urls)) {
      return NextResponse.json({ success: false, message: "urls must be an array." }, { status: 400 });
    }
    await connectDB();
    const removed = await deleteUnusedUploads(urls.filter((u) => typeof u === "string").slice(0, 100));
    return NextResponse.json({ success: true, removed });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file received." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    let buffer: any = Buffer.from(bytes);

    // Optimize image using sharp
    let isWebp = false;
    try {
      const sharp = (await import("sharp")).default;
      buffer = await sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      isWebp = true;
    } catch (err) {
      console.warn("Sharp optimization failed or skipped, saving original image:", err);
    }

    // Ensure uploads directory exists
    const uploadDir = getUploadDir();
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Determine extension and clean base filename
    const originalExt = path.extname(file.name).toLowerCase().replace(/^\./, "") || "png";
    const extension = isWebp ? "webp" : originalExt;
    const cleanBaseName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 60);

    const filename = `${Date.now()}-${cleanBaseName || "upload"}.${extension}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    // Return root-relative URL /uploads/${filename}
    // This allows images to load seamlessly on any VPS IP, domain, HTTP/HTTPS, or localhost
    const relativeUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: relativeUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error?.message || "Failed to upload file." 
    }, { status: 500 });
  }
}
