import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import VendorAuth from '@/lib/models/vendor-auth';
import Vendor from '@/lib/models/vendor';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find vendor auth record by verification token
    const vendorAuth = await VendorAuth.findOne({ verificationToken: token });
    if (!vendorAuth) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Update verification status
    vendorAuth.isVerified = true;
    vendorAuth.verificationToken = undefined;
    await vendorAuth.save();

    // Update vendor status
    await Vendor.findByIdAndUpdate(vendorAuth.vendorId, {
      verificationStatus: 'verified',
      status: 'active'
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now login to your account.'
    });

  } catch (error: any) {
    console.error('Error verifying vendor:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
