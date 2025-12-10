import { NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Amenity, { type IAmenity } from '@/lib/models/amenity';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();
    const { name, description, icon, status } = body;

    const updatedFields: Partial<IAmenity> = {
      name,
      description,
      icon, // This will be the Base64 string
      status,
    };

    const updatedAmenity: IAmenity | null = await Amenity.findByIdAndUpdate(id, updatedFields, { new: true, runValidators: true });
    if (!updatedAmenity) {
      return NextResponse.json({ success: false, error: "Amenity not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedAmenity });
  } catch (error: any) {
    console.error("Error updating amenity:", error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "Amenity with this name already exists." }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Failed to update amenity" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const deletedAmenity: IAmenity | null = await Amenity.findByIdAndDelete(id);
    if (!deletedAmenity) {
      return NextResponse.json({ success: false, error: "Amenity not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Amenity deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting amenity:", error);
    return NextResponse.json({ success: false, error: "Failed to delete amenity" }, { status: 500 });
  }
}
