import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PrivacyPolicy } from "@/lib/models/privacypolicy";

export async function GET() {
  await connectDB();
  const policies = await PrivacyPolicy.find().sort({ updatedAt: -1 });
  return NextResponse.json(policies);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const policy = await PrivacyPolicy.create(body);
  return NextResponse.json(policy, { status: 201 });
}
