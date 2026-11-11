import { NextResponse } from "next/server";
import { searchSimilarRTIRecords } from "@/services/semantic-search/search";
import { requireApiAuth } from "@/lib/api-auth";

export async function POST(request) {
  const { errorResponse } = await requireApiAuth([
    "GOVERNMENT OFFICER",
    "ADMINISTRATOR",
  ]);
  if (errorResponse) return errorResponse;

  try {
    const payload = await request.json();
    const { queryText, department, limit, threshold } = payload;

    if (!queryText) {
      return NextResponse.json(
        { error: "Search query text is required" },
        { status: 400 }
      );
    }

    const searchOutput = await searchSimilarRTIRecords(queryText, {
      department,
      limit: limit ? Number(limit) : 5,
      threshold: threshold ? Number(threshold) : 0.2,
    });

    return NextResponse.json(searchOutput);
  } catch (error) {
    console.error("Semantic search error:", error);
    return NextResponse.json(
      { error: error.message || "Semantic search failed" },
      { status: 500 }
    );
  }
}
