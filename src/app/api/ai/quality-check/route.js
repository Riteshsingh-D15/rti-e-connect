import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { categorizeRTI } from "@/services/ai/categorize";

export async function POST(request) {
  const { errorResponse } = await requireApiAuth();
  if (errorResponse) return errorResponse;

  try {
    const { subject = "", question = "" } = await request.json();
    const full = `${subject} ${question}`.trim();

    if (full.length < 10) {
      return NextResponse.json(
        { error: "Enter your RTI subject and question first." },
        { status: 400 }
      );
    }

    const ai = await categorizeRTI(subject, question);
    const suggestions = [];
    let score = 100;

    if (question.trim().length < 35) {
      score -= 20;
      suggestions.push(
        "Expand your query with exact record names (e.g. tender register, sanction order, inspection report) so the PIO can locate files quickly."
      );
    }

    if (!/\b(20\d{2}|fy|month|year|between|from|quarter|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(question)) {
      score -= 15;
      suggestions.push(
        "Mention a clear time period or financial year (e.g. FY 2024-25 or Jan 2024–Dec 2024) to avoid 'voluminous/unspecified period' delays."
      );
    }

    if (/^\s*(why|how come|explain why)\b/i.test(question) || /\bwhy did\b/i.test(question)) {
      score -= 20;
      suggestions.push(
        "Tip under RTI Section 2(f): PIOs can supply existing 'records, memos, or orders', not subjective reasons ('why'). Reframe as: 'Provide certified copies of file notings/orders explaining...'"
      );
    }

    if (!/\b(district|ward|tehsil|zone|division|block|hospital|school|road|department)\b/i.test(question)) {
      score -= 10;
      suggestions.push(
        "Specify the exact location, ward, school, division, or office jurisdiction."
      );
    }

    if (suggestions.length === 0) {
      suggestions.push(
        "Your RTI question clearly specifies records, scope, and jurisdiction under Section 6(1)."
      );
    }

    return NextResponse.json({
      readinessScore: Math.max(40, score),
      status: score >= 85 ? "Strong Filing" : score >= 65 ? "Needs Minor Details" : "Needs Clarification",
      suggestions,
      predictedCategory: ai.category,
      recommendedDepartment: ai.department,
      confidence: ai.confidence,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Quality check failed" },
      { status: 500 }
    );
  }
}
