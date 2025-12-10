import mongoose, { Document, Schema } from 'mongoose';

export interface IVendorEnquiry extends Document {
  vendorName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  location?: string;
  businessType?: 'Hostel' | 'PG' | 'Both';
  propertyCount?: number;
  status: 'pending' | 'responded' | 'closed' | 'spam';
  priority: 'low' | 'medium' | 'high';
  source: 'website' | 'phone' | 'email' | 'referral' | 'other';
  response?: string;
  respondedAt?: Date;
  respondedBy?: string;
  notes?: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VendorEnquirySchema: Schema = new Schema({
  vendorName: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
    maxlength: [200, 'Vendor name cannot be more than 200 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [300, 'Subject cannot be more than 300 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot be more than 2000 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  businessType: {
    type: String,
    enum: ['Hostel', 'PG', 'Both']
  },
  propertyCount: {
    type: Number,
    min: [0, 'Property count cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'responded', 'closed', 'spam'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  source: {
    type: String,
    enum: ['website', 'phone', 'email', 'referral', 'other'],
    default: 'website'
  },
  response: {
    type: String,
    trim: true,
    maxlength: [2000, 'Response cannot be more than 2000 characters']
  },
  respondedAt: {
    type: Date
  },
  respondedBy: {
    type: String,
    trim: true,
    maxlength: [100, 'Responded by cannot be more than 100 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  followUpDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes for better performance
VendorEnquirySchema.index({ email: 1 });
VendorEnquirySchema.index({ status: 1 });
VendorEnquirySchema.index({ priority: 1 });
VendorEnquirySchema.index({ createdAt: -1 });
VendorEnquirySchema.index({ followUpDate: 1 });

export default mongoose.models.VendorEnquiry || mongoose.model<IVendorEnquiry>('VendorEnquiry', VendorEnquirySchema);
