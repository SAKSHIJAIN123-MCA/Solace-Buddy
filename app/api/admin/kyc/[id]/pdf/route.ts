import { NextResponse, type NextRequest } from "next/server"
import { connectDB } from "@/lib/db"
import KYC from "@/lib/models/kyc"
import Student from "@/lib/models/student"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await connectDB()

    const record = await KYC.findById(id)
      .populate({
        path: "studentId",
        model: Student,
        select: "name email phone college course year",
      })
      .lean()

    if (!record) {
      return NextResponse.json({ error: "KYC not found" }, { status: 404 })
    }

    const pdfDoc = await PDFDocument.create()
    const pageWidth = 595.28 // A4 width
    const pageHeight = 841.89 // A4 height
    const margin = 40
    const sectionSpacing = 16
    const fieldSpacing = 12

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight])
    let yPosition = pageHeight - margin

    const addNewPageIfNeeded = (spaceNeeded: number) => {
      if (yPosition < margin + spaceNeeded) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight])
        yPosition = pageHeight - margin
      }
    }

    const drawHeader = () => {
      currentPage.drawText("STUDENT KYC VERIFICATION REPORT", {
        x: margin,
        y: yPosition,
        size: 20,
        font: fontBold,
        color: rgb(0, 0.2, 0.6),
      })
      yPosition -= 28

      const student = (record as any).studentId || {}
      const headerInfo = `Student: ${student.name || "N/A"} | Submitted: ${new Date(
        (record as any).submittedAt || (record as any).createdAt
      ).toLocaleDateString()}`
      currentPage.drawText(headerInfo, {
        x: margin,
        y: yPosition,
        size: 10,
        font,
        color: rgb(0.4, 0.4, 0.4),
      })
      yPosition -= 16

      currentPage.drawLine({
        start: { x: margin, y: yPosition },
        end: { x: pageWidth - margin, y: yPosition },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
      })
      yPosition -= sectionSpacing
    }

    const drawSectionTitle = (title: string) => {
      addNewPageIfNeeded(24)
      currentPage.drawRectangle({
        x: margin,
        y: yPosition - 18,
        width: pageWidth - margin * 2,
        height: 20,
        color: rgb(0.95, 0.97, 1),
        borderColor: rgb(0, 0.2, 0.6),
        borderWidth: 1,
      })
      currentPage.drawText(title, {
        x: margin + 8,
        y: yPosition - 14,
        size: 12,
        font: fontBold,
        color: rgb(0, 0.2, 0.6),
      })
      yPosition -= 28
    }

    const drawField = (label: string, value?: string | number | boolean | null, isHighlight = false) => {
      addNewPageIfNeeded(fieldSpacing + 4)
      const displayValue =
        value === undefined || value === null || value === ""
          ? "-"
          : typeof value === "boolean"
          ? value
            ? "Yes"
            : "No"
          : String(value)

      const labelText = `${label}:`
      currentPage.drawText(labelText, {
        x: margin + 8,
        y: yPosition,
        size: 10,
        font: fontBold,
        color: isHighlight ? rgb(0, 0.2, 0.6) : rgb(0.2, 0.2, 0.2),
      })
      currentPage.drawText(displayValue, {
        x: margin + 180,
        y: yPosition,
        size: 10,
        font,
        color: rgb(0.1, 0.1, 0.1),
        maxWidth: pageWidth - margin * 2 - 180,
      })
      yPosition -= fieldSpacing
    }

    drawHeader()

    // Step 1: Personal Details
    drawSectionTitle("STEP 1: PERSONAL DETAILS")
    drawField("Full Name", (record as any).name)
    drawField("Email", (record as any).email)
    drawField("Mobile Number", (record as any).mobileNumber)
    drawField(
      "Date of Birth",
      (record as any).dateOfBirth ? new Date((record as any).dateOfBirth).toLocaleDateString() : "-"
    )
    drawField("Permanent Address", (record as any).permanentAddress)
    drawField("Native City", (record as any).nativeCity)
    drawField("Native State", (record as any).nativeState)
    drawField("Caste", (record as any).caste)
    drawField("Marital Status", (record as any).maritalStatus)
    yPosition -= sectionSpacing

    // Step 1: Documents
    drawSectionTitle("STEP 1: SUBMITTED DOCUMENTS")
    const docFields = [
      { label: "Passport Size Photo", value: (record as any).passportSizePhoto },
      { label: "Aadhar Card (Front)", value: (record as any).aadharCardFront },
      { label: "Aadhar Card (Back)", value: (record as any).aadharCardBack },
      { label: "Residential Proof", value: (record as any).residentialProof },
    ]

    for (const doc of docFields) {
      addNewPageIfNeeded(fieldSpacing + 4)
      const status = doc.value ? "Uploaded" : "Not Uploaded"
      const statusColor = doc.value ? rgb(0.2, 0.7, 0.2) : rgb(0.9, 0.2, 0.2)
      currentPage.drawText(`${doc.label}:`, {
        x: margin + 8,
        y: yPosition,
        size: 10,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      })
      currentPage.drawText(status, {
        x: margin + 180,
        y: yPosition,
        size: 10,
        font: fontBold,
        color: statusColor,
      })
      yPosition -= fieldSpacing
    }
    yPosition -= sectionSpacing

    // Step 2: Professional Details
    drawSectionTitle("STEP 2: PROFESSIONAL DETAILS")
    drawField("Profession", (record as any).profession)
    drawField("College/Company Name", (record as any).collegeCompanyName)
    drawField("College/Company Address", (record as any).collegeCompanyAddress)
    drawField(
      "Studying/Working Since",
      (record as any).studyingWorkingSince
        ? new Date((record as any).studyingWorkingSince).toLocaleDateString()
        : "-"
    )
    drawField("Proof of Location", (record as any).proofOfLocation ? "Uploaded" : "Not Uploaded")
    yPosition -= sectionSpacing

    // Step 3: Family Background
    drawSectionTitle("STEP 3: FAMILY BACKGROUND")
    drawField("Father's Name", (record as any).fatherName)
    drawField("Father's Mobile Number", (record as any).fatherMobileNumber)
    yPosition -= sectionSpacing

    // Step 4: Self Declaration
    drawSectionTitle("STEP 4: SELF DECLARATION")
    drawField("Criminal History", (record as any).criminalHistory)
    if ((record as any).criminalHistoryDetails) {
      drawField("Criminal History Details", (record as any).criminalHistoryDetails)
    }
    drawField("Agrees to House Rules", (record as any).agreeToRules)
    drawField("Agrees to Verification", (record as any).agreeToVerification)
    drawField("Agrees to Lock-in Period", (record as any).agreeLockInPeriod)
    drawField("Agrees to Terms & Conditions", (record as any).agreeTermsConditions)
    drawField(
      "PG Start Date",
      (record as any).pgStartDate ? new Date((record as any).pgStartDate).toLocaleDateString() : "-"
    )
    yPosition -= sectionSpacing

    // Summary Section
    drawSectionTitle("SUBMISSION SUMMARY")
    drawField("Status", (record as any).isCompleted ? "Completed" : "Incomplete", true)
    drawField("Current Step", `${(record as any).currentStep} of 4`, true)
    drawField("Created At", new Date((record as any).createdAt).toLocaleString())
    drawField("Last Updated", new Date((record as any).updatedAt).toLocaleString())
    if ((record as any).submittedAt) {
      drawField("Submitted At", new Date((record as any).submittedAt).toLocaleString(), true)
    }

    // Footer
    addNewPageIfNeeded(30)
    yPosition -= 12
    currentPage.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: pageWidth - margin, y: yPosition },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    })
    yPosition -= 12
    currentPage.drawText("This is an official KYC verification report generated by the Admin Portal.", {
      x: margin,
      y: yPosition,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
    yPosition -= 12
    currentPage.drawText(`Generated on ${new Date().toLocaleString()}`, {
      x: margin,
      y: yPosition,
      size: 9,
      font,
      color: rgb(0.6, 0.6, 0.6),
    })

    const pdfBytes = await pdfDoc.save()
    const filename = `KYC_${(record as any).name || "Report"}_${new Date().getTime()}.pdf`

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename.replace(/[^\w-]+/g, "_")}.pdf"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    console.error("[KYC PDF] Error:", err)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
