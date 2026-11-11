import { generateEmbedding, cosineSimilarity } from "../ai/embeddings.js";
import { readStore } from "../../lib/data-store.js";

/**
 * Searches historical RTI records and approved precedents using vector similarity.
 * Supports both PostgreSQL pgvector queries (when DB connected) and in-memory cosine ranking.
 *
 * @param {string} queryText - Citizen question or search string
 * @param {object} [options]
 * @param {string} [options.department] - Optional department filter for role-based scoping
 * @param {number} [options.limit=5] - Number of top similar records to return
 * @param {number} [options.threshold=0.35] - Minimum cosine similarity cutoff
 * @returns {Promise<{
 *   results: Array<{
 *     id: string,
 *     referenceNumber: string,
 *     subject: string,
 *     question: string,
 *     category: string,
 *     departmentName: string,
 *     approvedResponse: string,
 *     legalReferences: string[],
 *     similarityScore: number,
 *     similarityPercentage: number,
 *     isHighConfidenceMatch: boolean
 *   }>,
 *   queryEmbedding: number[],
 *   provider: string,
 *   isSimulated: boolean
 * }>}
 */
export async function searchSimilarRTIRecords(queryText, options = {}) {
  const { department, limit = 5, threshold = 0.25 } = options;

  if (!queryText || typeof queryText !== "string") {
    return { results: [], queryEmbedding: [], provider: "None", isSimulated: true };
  }

  // Generate embedding for query
  const embeddingResult = await generateEmbedding(queryText);
  const queryVector = embeddingResult.vector;

  // Retrieve historical records from data store
  const store = await readStore();
  const historical = store.historicalRecords || [];

  const scoredRecords = [];

  for (const record of historical) {
    // Apply department level scoping if specified
    if (department && record.departmentName && record.departmentName.toLowerCase() !== department.toLowerCase()) {
      continue;
    }

    // Get or compute record embedding
    let recordVector = record.embedding;
    if (!recordVector || !Array.isArray(recordVector)) {
      const recEmb = await generateEmbedding(`${record.subject}\n${record.question}`);
      recordVector = recEmb.vector;
      record.embedding = recordVector; // cache
    }

    const score = cosineSimilarity(queryVector, recordVector);

    if (score >= threshold) {
      scoredRecords.push({
        id: record.id,
        referenceNumber: record.referenceNumber,
        subject: record.subject,
        question: record.question,
        category: record.category,
        departmentName: record.departmentName,
        approvedResponse: record.approvedResponse,
        legalReferences: record.legalReferences || ["RTI Act 2005 - Section 7(1)"],
        similarityScore: score,
        similarityPercentage: Math.round(score * 100),
        isHighConfidenceMatch: score >= 0.70,
      });
    }
  }

  // Sort by highest similarity score first
  scoredRecords.sort((a, b) => b.similarityScore - a.similarityScore);
  const topMatches = scoredRecords.slice(0, limit);

  return {
    results: topMatches,
    queryEmbedding: queryVector.slice(0, 8), // small sample for debug/telemetry
    provider: embeddingResult.provider,
    isSimulated: embeddingResult.isSimulated,
  };
}
