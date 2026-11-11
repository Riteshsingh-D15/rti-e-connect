export const AI_CATEGORIES = [
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

export const DEPARTMENT_MAP = {
  education: "Education Department",
  healthcare: "Health Department",
  infrastructure: "Public Works Department",
  electricity: "Electricity Department",
  water: "Water Resources Department",
  transport: "Transport Department",
  municipal: "Municipal Administration",
  police: "Police Department",
  land: "Revenue Department",
  agriculture: "Agriculture Department",
  environment: "Environment Department",
  employment: "Labour and Employment Department",
  finance: "Finance Department",
};

export function categorizeRti({ subject = "", question = "" }) {
  const combined = `${subject} ${question}`.toLowerCase();

  let category = "Other";
  let department = "General Administration";

  if (/school|college|education|student|teacher|scholarship/i.test(combined)) {
    category = "Education";
    department = DEPARTMENT_MAP.education;
  } else if (/hospital|health|doctor|medicine|clinic|medical|covid|ambulance/i.test(combined)) {
    category = "Healthcare";
    department = DEPARTMENT_MAP.healthcare;
  } else if (/road|bridge|building|construction|infrastructure|public works|drain|pavement/i.test(combined)) {
    category = "Public Infrastructure";
    department = DEPARTMENT_MAP.infrastructure;
  } else if (/electricity|power|transformer|meter|load shedding|billing/i.test(combined)) {
    category = "Electricity";
    department = DEPARTMENT_MAP.electricity;
  } else if (/water|tap|pipeline|sewer|supply|tank/i.test(combined)) {
    category = "Water Supply";
    department = DEPARTMENT_MAP.water;
  } else if (/bus|train|transport|road permit|traffic|railway/i.test(combined)) {
    category = "Transportation";
    department = DEPARTMENT_MAP.transport;
  } else if (/municipal|garbage|street|drain|property tax|ward/i.test(combined)) {
    category = "Municipal Administration";
    department = DEPARTMENT_MAP.municipal;
  } else if (/police|crime|station|complaint|fir|arrest|misconduct/i.test(combined)) {
    category = "Police";
    department = DEPARTMENT_MAP.police;
  } else if (/land|property|survey|record|revenue|patta|mutation/i.test(combined)) {
    category = "Revenue and Land Records";
    department = DEPARTMENT_MAP.land;
  } else if (/agriculture|farmer|crop|soil|irrigation|seed|mandi/i.test(combined)) {
    category = "Agriculture";
    department = DEPARTMENT_MAP.agriculture;
  } else if (/pollution|forest|environment|air|water pollution|waste/i.test(combined)) {
    category = "Environment";
    department = DEPARTMENT_MAP.environment;
  } else if (/job|employment|scheme|unemployment|vacancy|recruitment/i.test(combined)) {
    category = "Employment";
    department = DEPARTMENT_MAP.employment;
  } else if (/fund|budget|grant|finance|tax|subsidy/i.test(combined)) {
    category = "Finance";
    department = DEPARTMENT_MAP.finance;
  }

  const summary = (subject || question || "RTI request").trim();
  const keywords = Array.from(
    new Set(
      [subject, question]
        .join(" ")
        .split(/\s+/)
        .filter((word) => word.length > 4)
        .slice(0, 6)
    )
  );

  const confidence = Math.min(
    0.97,
    0.7 + Math.min(0.25, ((summary.length + keywords.length) / 64) * 0.2)
  );

  return {
    category,
    department,
    keywords: keywords.length ? keywords : ["Public Information"],
    summary: summary || "Request for government information records.",
    confidence: Number(confidence.toFixed(2)),
    reason: `The application concerns ${category.toLowerCase()} information and falls under ${department}.`,
  };
}

export function generateDepartmentRecommendation(input) {
  const analysis = categorizeRti(input);
  return {
    ...analysis,
    recommendedDepartment: analysis.department,
    source: "mock-provider",
  };
}

export function buildEmbedding(text) {
  const seed = text.split(" ").reduce((acc, word) => acc + word.length, 0);
  return Array.from({ length: 12 }, (_, index) => ((seed + index * 13) % 97) / 97);
}

export function buildRagDraft(application, historicalRecords = []) {
  const records = historicalRecords.slice(0, 3);
  const response = `Subject: ${application.subject}\n\nApplication Reference: ${application.referenceNumber}\n\nPoint-wise response:\n1. The information requested has been reviewed against departmental records.\n2. Relevant documents have been identified and cross-checked with approved historical records.\n3. Some supporting material may be unavailable and needs officer confirmation.\n\nSource references:\n${records
    .map((record) => `- ${record.title} (${record.department})`)
    .join("\n") || "- No directly matching record available"}\n\nVerified legal references:\n- Right to Information Act, 2005\n- Departmental record retention norms\n\nMissing information:\n- Verification of exact record scope may be required.\n\nSuggested next steps:\n- Confirm record availability\n- Attach supporting material\n- Send final approval after legal review`;

  return {
    subject: `Response to ${application.referenceNumber}`,
    draft: response,
    sources: records,
    generatedBy: "mock-rag-provider",
  };
}
