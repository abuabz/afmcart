import { NextRequest, NextResponse } from "next/server";
import { User } from "@/lib/backend/models/user.model";
import { OrderOtpService } from "@/lib/backend/utils/otpServices";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/backend/db";
import { z } from "zod";

const userRequestOTPSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate using Zod
    const validationResult = userRequestOTPSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: "Invalid email", errors: validationResult.error },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;
    const user = await User.findOne({ M02_email: email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // OTP Generation logic (Mocked session for Next.js - you'd use a DB or Redis here)
    const orderOtpService = new OrderOtpService({}); // Note: Express session needs replacement
    const OTP = orderOtpService.sendOTP({ email });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: {
        name: "Ecommerce",
        address: "ecommerce@gmail.com",
      },
      to: email,
      subject: "OTP for login",
      text: `Your OTP is ${OTP}`,
    });

    return NextResponse.json(
      { success: true, message: "Otp sent successfully", data: {} },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in request-otp:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
