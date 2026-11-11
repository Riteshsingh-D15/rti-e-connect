import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { ensureWritableSubdir } from "@/lib/storage-paths";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTS = new Set([".pdf", ".docx", ".doc", ".jpg", ".jpeg", ".png"]);

export async function POST(request) {
  const { session, errorResponse } = await requireApiAuth();
  if (errorResponse) return errorResponse;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const originalName = path.basename(file.name || "document.pdf");
    const ext = path.extname(originalName).toLowerCase();

    if (!ALLOWED_EXTS.has(ext)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Allowed formats: PDF, DOCX, DOC, JPG, PNG.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds maximum 5 MB upload limit." },
        { status: 400 }
      );
    }

    const uploadDir = await ensureWritableSubdir("uploads");
    const safeBase = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storedName = `${Date.now()}-${session.user.id}-${safeBase}`;
    const destPath = path.join(uploadDir, storedName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(destPath, buffer);

    // Lightweight OCR / metadata preview without hallucination
    const ocrStatus =
      ext === ".jpg" || ext === ".jpeg" || ext === ".png"
        ? "Image queued & stored for officer visual verification"
        : ext === ".pdf"
        ? "PDF document stored cleanly in dossier repository"
        : "Word document stored cleanly in dossier repository";

    return NextResponse.json(
      {
        success: true,
        document: {
          id: `doc-${Date.now()}`,
          fileName: originalName,
          storedName,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
          url: `/api/uploads/${encodeURIComponent(storedName)}`,
          ocrStatus,
          uploadedAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "File upload failed" },
      { status: 500 }
    );
  }
}
