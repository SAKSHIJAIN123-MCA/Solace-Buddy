import { NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Amenity, { type IAmenity } from '@/lib/models/amenity';

export async function GET() {
  try {
    await connectDB();
    const amenities: IAmenity[] = await Amenity.find({});
    return NextResponse.json({ success: true, data: amenities });
  } catch (error) {
    console.error("Error fetching amenities:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch amenities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, description, icon, status } = body;

    if (!name || !icon || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields: name, icon, status" }, { status: 400 });
    }

    const newAmenityData: Partial<IAmenity> = {
      name,
      description,
      icon, // This will be the Base64 string
      status,
    };

    const newAmenity: IAmenity = await Amenity.create(newAmenityData);
    return NextResponse.json({ success: true, data: newAmenity }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating amenity:", error);
    if (error.code === 11000) { // Duplicate key error
      return NextResponse.json({ success: false, error: "Amenity with this name already exists." }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Failed to create amenity" }, { status: 500 });
  }
}
