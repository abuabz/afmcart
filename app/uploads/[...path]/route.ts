import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// Helper to determine content type from file extension
function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".webp":
      return "image/webp";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".avif":
      return "image/avif";
    case ".bmp":
      return "image/bmp";
    case ".ico":
      return "image/x-icon";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

type Props = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { path: segments } = await params;

    if (!segments || segments.length === 0) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    // Resolve safe path to prevent directory traversal
    const safePath = path.normalize(path.join(...segments)).replace(/^(\.\.[\/\\])+/, "");

    const uploadDir = path.resolve(process.cwd(), "public", "uploads");
    const filePath = path.resolve(uploadDir, safePath);

    // Security check: ensure path is strictly inside upload directory
    if (!filePath.startsWith(uploadDir)) {
      return new NextResponse("Access Denied", { status: 403 });
    }

    if (!existsSync(filePath)) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return new NextResponse("Not a file", { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const contentType = getContentType(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving uploaded file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function HEAD(_request: NextRequest, { params }: Props) {
  try {
    const { path: segments } = await params;
    if (!segments || segments.length === 0) return new NextResponse(null, { status: 404 });

    const safePath = path.normalize(path.join(...segments)).replace(/^(\.\.[\/\\])+/, "");
    const uploadDir = path.resolve(process.cwd(), "public", "uploads");
    const filePath = path.resolve(uploadDir, safePath);

    if (!filePath.startsWith(uploadDir) || !existsSync(filePath)) {
      return new NextResponse(null, { status: 404 });
    }

    const fileStat = await stat(filePath);
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": getContentType(filePath),
        "Content-Length": fileStat.size.toString(),
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

