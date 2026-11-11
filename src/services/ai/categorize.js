import { recommendDepartment, DEPARTMENT_MAPPINGS } from "./department.js";

export const RTI_CATEGORIES = [
  "Education",
  "Healthcare",
  "Public Infrastructure",
  "Electricity",
  "Water Supply",
  "Transportation",
  "Municipal Administration",
  "Police",
  "Revenue and Land Records",
  "Agriculture",
  "Environment",
  "Employment",
  "Finance",
  "Other",
];

/**
 * Analyzes an RTI application and generates structured categorization, summary, keywords,
 * department recommendation, and confidence score.
 *
 * @param {string} subject - RTI Subject
 * @param {string} question - Detailed RTI Question
 * @returns {Promise<{
 *   category: string,
 *   department: string,
 *   keywords: string[],
 *   summary: string,
 *   confidence: number,
 *   reason: string,
 *   provider: string,
 *   isSimulated: boolean
 * }>}
 */
export async function categorizeRTI(subject = "", question = "") {
  const fullText = `${subject}\n${question}`.trim();

  // 1. Google Gemini Provider if available
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are an expert Indian Right to Information (RTI Act 2005) administrative classifier.
Analyze the following citizen RTI request and return ONLY a valid JSON object with these exact keys:
{
  "category": "One of: Education, Healthcare, Public Infrastructure, Electricity, Water Supply, Transportation, Municipal Administration, Police, Revenue and Land Records, Agriculture, Environment, Employment, Finance, Other",
  "department": "Name of the competent Indian government department",
  "keywords": ["Keyword1", "Keyword2"],
  "summary": "A concise 1-sentence summary of the requested government records",
  "confidence": 0.95,
  "reason": "Clear explanation of why this belongs to the predicted category"
}

RTI Subject: ${subject}
RTI Query: ${question}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          return {
            category: parsed.category || "Other",
            department: parsed.department || "Municipal Administration and Urban Development",
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords : ["RTI", "Public Record"],
            summary: parsed.summary || subject,
            confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.92,
            reason: parsed.reason || "Classified via Gemini AI LLM engine.",
            provider: "Google Gemini 1.5 Flash (Cloud LLM)",
            isSimulated: false,
          };
        }
      }
    } catch (err) {
      console.warn("Gemini categorization error, falling back to local engine:", err.message);
    }
  }

  // 2. OpenAI Provider if available
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are an Indian RTI Act 2005 classification engine. Return JSON with category, department, keywords, summary, confidence, reason.",
            },
            {
              role: "user",
              content: `Subject: ${subject}\nQuestion: ${question}`,
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            category: parsed.category || "Other",
            department: parsed.department || "Municipal Administration and Urban Development",
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords : ["RTI Record"],
            summary: parsed.summary || subject,
            confidence: parsed.confidence || 0.91,
            reason: parsed.reason || "Classified via OpenAI GPT engine.",
            provider: "OpenAI GPT-4o-mini (Cloud LLM)",
            isSimulated: false,
          };
        }
      }
    } catch (err) {
      console.warn("OpenAI categorization error, falling back to local engine:", err.message);
    }
  }

  // 3. High-Precision Development Engine (Deterministic Domain Categorizer)
  const normalized = fullText.toLowerCase();

  // Find best department and category
  const deptResult = recommendDepartment(fullText);
  let detectedCategory = "Other";

  for (const mapping of DEPARTMENT_MAPPINGS) {
    if (mapping.department.toLowerCase() === deptResult.department.toLowerCase()) {
      detectedCategory = mapping.category;
      break;
    }
  }

  // Extract meaningful keywords
  const stopWords = new Set([
    "the", "and", "for", "with", "from", "that", "this", "details", "provide", "please",
    "request", "information", "under", "act", "regarding", "about", "copy", "records",
    "last", "year", "during", "what", "which", "where", "how", "much", "many", "give", "me"
  ]);

  const candidateWords = fullText
    .split(/[\s,.;:?!()"-]+/)
    .filter((w) => w.length > 3 && !stopWords.has(w.toLowerCase()));

  // Deduplicate and capitalize
  const uniqueKeywords = Array.from(
    new Set(
      candidateWords.map(
        (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      )
    )
  ).slice(0, 5);

  if (uniqueKeywords.length === 0) {
    uniqueKeywords.push("Public Information", "Administrative Records");
  }

  // Build clean summary
  const cleanSummary =
    subject.length > 10
      ? `Request for ${subject.replace(/^(request for|please provide|provide)\s*/i, "").trim()}.`
      : `Citizen query concerning ${detectedCategory.toLowerCase()} administrative data.`;

  return {
    category: detectedCategory,
    department: deptResult.department,
    keywords: uniqueKeywords,
    summary: cleanSummary,
    confidence: deptResult.confidence,
    reason: `The application text explicitly references ${uniqueKeywords.slice(0, 2).join(" and ")} concerning ${detectedCategory.toLowerCase()} administration.`,
    provider: "Development Deterministic Engine (Configure GEMINI_API_KEY in .env for Cloud LLM)",
    isSimulated: true,
  };
}
