import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IStudentAuth extends Document {
  studentId: Types.ObjectId
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

const StudentAuthSchema = new Schema<IStudentAuth>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
)

export default mongoose.models.StudentAuth || mongoose.model<IStudentAuth>("StudentAuth", StudentAuthSchema)
