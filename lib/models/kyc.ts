import mongoose from "mongoose"

const kycSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
    },

    // Step 1: Personal Details
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      match: [/^\d{10}$/, "Mobile number must be exactly 10 digits"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"],
    },
    permanentAddress: {
      type: String,
      required: [true, "Permanent address is required"],
      minlength: [10, "Address must be at least 10 characters"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    caste: {
      type: String,
      enum: ["Hindu", "Muslim", "Other"],
      required: [true, "Caste is required"],
    },
    maritalStatus: {
      type: String,
      enum: ["Married", "Unmarried"],
      required: [true, "Marital status is required"],
    },
    passportSizePhoto: {
      type: String,
      required: [true, "Passport size photo is required"],
    },
    nativeCity: {
      type: String,
      required: [true, "Native city is required"],
      trim: true,
    },
    nativeState: {
      type: String,
      required: [true, "Native state is required"],
      trim: true,
    },
    aadharCardFront: {
      type: String,
      required: [true, "Aadhar card front is required"],
    },
    aadharCardBack: {
      type: String,
      required: [true, "Aadhar card back is required"],
    },
    residentialProof: {
      type: String,
      required: [true, "Residential proof is required"],
    },

    // Step 2: Profession Related Details
    profession: {
      type: String,
      enum: ["Student", "Working", "Other"],
      required: [true, "Profession is required"],
    },
    collegeCompanyName: {
      type: String,
      required: [true, "College/Company name is required"],
      trim: true,
    },
    collegeCompanyAddress: {
      type: String,
      required: [true, "College/Company address is required"],
      minlength: [10, "Address must be at least 10 characters"],
    },
    studyingWorkingSince: {
      type: Date,
      required: [true, "Studying/Working since date is required"],
    },
    proofOfLocation: {
      type: String,
      required: [true, "Proof of location is required"],
    },

    // Step 3: Family Background
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true,
      minlength: [2, "Father's name must be at least 2 characters"],
    },
    fatherMobileNumber: {
      type: String,
      required: [true, "Father's mobile number is required"],
      match: [/^\d{10}$/, "Father's mobile number must be exactly 10 digits"],
    },

    // Step 4: Self Declaration
    criminalHistory: {
      type: String,
      enum: ["No", "Yes"],
      required: [true, "Criminal history declaration is required"],
    },
    criminalHistoryDetails: {
      type: String,
      default: "",
    },
    agreeToRules: {
      type: Boolean,
      required: [true, "You must agree to house rules"],
    },
    agreeToVerification: {
      type: Boolean,
      required: [true, "You must agree to verification"],
    },
    agreeLockInPeriod: {
      type: Boolean,
      required: [true, "You must agree to lock-in period"],
    },
    pgStartDate: {
      type: Date,
      required: [true, "PG start date is required"],
    },
    agreeTermsConditions: {
      type: Boolean,
      required: [true, "You must agree to terms and conditions"],
    },

    // Status and metadata
    currentStep: {
      type: Number,
      default: 1,
      min: 1,
      max: 4,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    submittedAt: Date,
  },
  {
    timestamps: true,
  },
)

const KYC = mongoose.models.KYC || mongoose.model("KYC", kycSchema)

export default KYC
