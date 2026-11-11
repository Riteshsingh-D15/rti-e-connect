import { NextResponse } from "next/server";
import { generateRTIResponseDraft } from "@/services/ai/generateResponse";
import { requireApiAuth } from "@/lib/api-auth";

export async function POST(request) {
  const { errorResponse } = await requireApiAuth([
    "GOVERNMENT OFFICER",
    "ADMINISTRATOR",
  ]);
  if (errorResponse) return errorResponse;

  try {
    const payload = await request.json();
    const { referenceNumber, subject, question, department, applicantName } =
      payload;

    if (!subject || !question) {
      return NextResponse.json(
        { error: "Subject and question are required to generate response draft" },
        { status: 400 }
      );
    }

    const draft = await generateRTIResponseDraft({
      referenceNumber: referenceNumber || "RTI-DRAFT",
      subject,
      question,
      department: department || "Competent Public Authority",
      applicantName: applicantName || "Citizen Applicant",
    });

    return NextResponse.json(draft);
  } catch (error) {
    console.error("Draft response generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate draft response" },
      { status: 500 }
    );
  }
}
