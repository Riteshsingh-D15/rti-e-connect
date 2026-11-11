import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { getWritableDataDir, SEED_DATA_DIR } from "@/lib/storage-paths";

async function readUploadedFile(safeFile) {
  const writablePath = path.join(/*turbopackIgnore: true*/ getWritableDataDir(), "uploads", safeFile);
  const seedPath = path.join(/*turbopackIgnore: true*/ SEED_DATA_DIR, "uploads", safeFile);
  const candidates =
    writablePath === seedPath ? [writablePath] : [writablePath, seedPath];

  for (const candidate of candidates) {
    try {
      return await fs.readFile(/*turbopackIgnore: true*/ candidate);
    } catch {
      // Try fallback directory if not in writable dir
    }
  }
  return null;
}

const MIME_BY_EXT = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
};

export async function GET(request, { params }) {
  const { errorResponse } = await requireApiAuth();
  if (errorResponse) return errorResponse;

  try {
    const { file } = await params;
    const safeFile = path.basename(decodeURIComponent(file));
    const data = await readUploadedFile(safeFile);
    if (!data) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    const ext = path.extname(safeFile).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || "application/octet-stream";

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${safeFile}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
}
