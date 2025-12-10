import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PrivacyPolicy } from "@/lib/models/privacypolicy";

export async function GET(_: any, { params }: { params: { id: string } }) {
  await connectDB();
  const policy = await PrivacyPolicy.findById(params.id);
  return NextResponse.json(policy);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const policy = await PrivacyPolicy.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json(policy);
}

export async function DELETE(_: any, { params }: { params: { id: string } }) {
  await connectDB();
  await PrivacyPolicy.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Deleted" });
}
