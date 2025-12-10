import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import VendorAuth from '@/lib/models/vendor-auth';
import Vendor from '@/lib/models/vendor';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get token from cookie or Authorization header
    const token = request.cookies.get('vendor-token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Find vendor
    const vendor = await Vendor.findById(decoded.vendorId);
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Check if vendor is still active
    if (vendor.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Account is not active' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: vendor._id,
        name: vendor.name,
        ownerName: vendor.ownerName,
        email: vendor.email,
        phone: vendor.phone,
        businessType: vendor.businessType,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        status: vendor.status,
        verificationStatus: vendor.verificationStatus,
        properties: vendor.properties,
        totalRooms: vendor.totalRooms,
        occupiedRooms: vendor.occupiedRooms,
        monthlyRevenue: vendor.monthlyRevenue,
        totalBookings: vendor.totalBookings,
        rating: vendor.rating
      }
    });

  } catch (error: any) {
    console.error('Error getting vendor profile:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { success: false, error: 'Authentication token expired' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
