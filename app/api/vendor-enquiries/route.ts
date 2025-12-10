import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import VendorEnquiry from '@/lib/models/vendor-enquiry';

// GET - Fetch all vendor enquiries
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    let query: any = {};
    
    if (search) {
      query.$or = [
        { vendorName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (priority !== 'all') {
      query.priority = priority;
    }

    const enquiries = await VendorEnquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await VendorEnquiry.countDocuments(query);
    
    // Get statistics
    const stats = await VendorEnquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const priorityStats = await VendorEnquiry.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const statistics = {
      total,
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      responded: stats.find(s => s._id === 'responded')?.count || 0,
      closed: stats.find(s => s._id === 'closed')?.count || 0,
      spam: stats.find(s => s._id === 'spam')?.count || 0,
      high: priorityStats.find(s => s._id === 'high')?.count || 0,
      medium: priorityStats.find(s => s._id === 'medium')?.count || 0,
      low: priorityStats.find(s => s._id === 'low')?.count || 0
    };

    return NextResponse.json({
      success: true,
      data: enquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      statistics
    });
  } catch (error: any) {
    console.error('Error fetching vendor enquiries:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new vendor enquiry (for frontend form submissions)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    const enquiry = new VendorEnquiry(body);
    await enquiry.save();
    
    return NextResponse.json({
      success: true,
      data: enquiry,
      message: 'Vendor enquiry submitted successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vendor enquiry:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
