import { NextResponse } from "next/server"
import { connectDB } from "@/lib/backend/db"
import { sweepOrphanUploads } from "@/lib/backend/uploads"

// Deletes uploaded files that no record uses. Add ?dryRun=1 to preview.
export async function POST(request: Request) {
  try {
    await connectDB()
    const dryRun = new URL(request.url).searchParams.get("dryRun") === "1"
    const result = await sweepOrphanUploads(60 * 60 * 1000, dryRun)
    return NextResponse.json({ success: true, dryRun, ...result })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
