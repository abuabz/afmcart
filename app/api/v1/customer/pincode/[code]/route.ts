import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ success: false, message: "Enter a valid 6-digit pincode." }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${code}`, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error("Postal lookup failed");
    const payload = await response.json();
    const office = payload?.[0]?.PostOffice?.[0];
    if (!office) return NextResponse.json({ success: false, message: "No postal area found for that pincode." }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: { place: office.Block || office.Name, district: office.District, state: office.State },
    }, { headers: { "Cache-Control": "public, max-age=3600" } });
  } catch {
    return NextResponse.json({ success: false, message: "Postal lookup is temporarily unavailable." }, { status: 502 });
  }
}