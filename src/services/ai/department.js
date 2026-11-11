/**
 * Intelligent Department Recommendation Engine
 * Combines Indian administrative rules, keyword mappings, and AI predictions
 */

export const DEPARTMENT_MAPPINGS = [
  {
    department: "Public Works Department",
    code: "PWD",
    category: "Public Infrastructure",
    keywords: ["road", "bridge", "highway", "construction", "tender", "pothole", "flyover", "building", "drainage", "contractor", "pwd", "asphalt"],
    description: "State and regional public infrastructure, road network expansion and civil engineering projects.",
  },
  {
    department: "Education Department",
    code: "EDU",
    category: "Education",
    keywords: ["school", "college", "teacher", "curriculum", "scholarship", "university", "admission", "student", "mid-day meal", "syllabus", "cbse", "exam"],
    description: "Primary, secondary, and higher education institutions, faculty appointments and student welfare.",
  },
  {
    department: "Health and Family Welfare Department",
    code: "HLT",
    category: "Healthcare",
    keywords: ["hospital", "doctor", "medicine", "clinic", "dispensary", "phc", "chc", "vaccine", "health center", "patient", "ambulance", "drug supply"],
    description: "Public health delivery, primary healthcare centres, government hospitals, and medical infrastructure.",
  },
  {
    department: "Electricity and Power Department",
    code: "ELEC",
    category: "Electricity",
    keywords: ["power", "electricity", "transformer", "load shedding", "bill", "meter", "substation", "grid", "voltage", "discom", "power cut"],
    description: "State electricity distribution, rural electrification, grid stability and tariff regulation.",
  },
  {
    department: "Public Health Engineering / Water Supply Department",
    code: "WAT",
    category: "Water Supply",
    keywords: ["water", "pipeline", "drinking water", "jal jeevan", "borewell", "sewage", "filtration", "water supply", "tap", "contamination", "leakage"],
    description: "Potable water supply, pipelines, sewage disposal, water treatment and Jal Jeevan Mission works.",
  },
  {
    department: "Transport Department",
    code: "TRN",
    category: "Transportation",
    keywords: ["bus", "transport", "rto", "license", "vehicle", "traffic", "permit", "fare", "depot", "state transport", "pollution certificate"],
    description: "Motor vehicles administration, Regional Transport Offices, and public bus networks.",
  },
  {
    department: "Municipal Administration and Urban Development",
    code: "MUN",
    category: "Municipal Administration",
    keywords: ["municipality", "nagar nigam", "garbage", "sanitation", "property tax", "trade license", "building permission", "street light", "waste management"],
    description: "Urban local bodies, municipal corporations, solid waste management, and town planning.",
  },
  {
    department: "Home / Police Department",
    code: "POL",
    category: "Police",
    keywords: ["police", "fir", "crime", "station", "chowki", "investigation", "complaint", "traffic police", "security", "arrest", "law and order"],
    description: "Law enforcement, police stations, investigation records, and citizen safety.",
  },
  {
    department: "Revenue and Land Records Department",
    code: "REV",
    category: "Revenue and Land Records",
    keywords: ["land", "khasra", "khatauni", "patwari", "registry", "mutation", "survey", "tehsil", "stamp duty", "encroachment", "revenue record", "land acquisition"],
    description: "Land revenue administration, land titling, mutation, cadastral surveys and tehsil operations.",
  },
  {
    department: "Agriculture and Farmers Welfare Department",
    code: "AGR",
    category: "Agriculture",
    keywords: ["farmer", "crop", "fertilizer", "seed", "subsidy", "mandi", "pm kisan", "irrigation", "soil", "pesticide", "harvest"],
    description: "Farmer welfare schemes, crop insurance, fertilizer distribution, and agricultural extension.",
  },
  {
    department: "Environment and Forest Department",
    code: "ENV",
    category: "Environment",
    keywords: ["forest", "pollution", "tree", "wildlife", "environmental clearance", "air quality", "river", "sanctuary", "timber", "green zone"],
    description: "Environmental protection, state pollution control boards, wildlife preservation and afforestation.",
  },
  {
    department: "Labour and Employment Department",
    code: "EMP",
    category: "Employment",
    keywords: ["employment", "job", "mgnrega", "wages", "labour", "worker", "epfo", "unskilled", "work permit", "unemployment", "pension"],
    description: "Employment exchanges, MGNREGA implementation, minimum wage compliance, and unorganized workers.",
  },
  {
    department: "Finance and Treasury Department",
    code: "FIN",
    category: "Finance",
    keywords: ["treasury", "audit", "budget", "pension", "grant", "state finance", "expenditure", "taxation", "allotment", "comptroller"],
    description: "State treasury, budgetary sanctions, financial audits, and public expenditure control.",
  },
];

/**
 * Recommends the best matching government department based on application text and category.
 * @param {string} text - Subject and question of RTI application
 * @param {string} [category] - Optional pre-predicted category
 * @returns {{ department: string, code: string, confidence: number, reasoning: string, alternateDepartments: Array }}
 */
export function recommendDepartment(text = "", category = "") {
  const normalized = text.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;
  const scoredList = [];

  for (const dept of DEPARTMENT_MAPPINGS) {
    let score = 0;

    // Check category match
    if (category && dept.category.toLowerCase() === category.toLowerCase()) {
      score += 5;
    }

    // Check keyword hits
    for (const kw of dept.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 2;
      }
    }

    if (score > 0) {
      scoredList.push({ dept, score });
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = dept;
    }
  }

  // Fallback to General / Municipal Administration if no strong match
  if (!bestMatch || highestScore < 2) {
    return {
      department: "Municipal Administration and Urban Development",
      code: "MUN",
      confidence: 0.65,
      reasoning: "Assigned default public administrative authority pending officer verification.",
      alternateDepartments: DEPARTMENT_MAPPINGS.slice(0, 3).map((d) => ({ name: d.department, code: d.code })),
    };
  }

  // Calculate normalized confidence score between 0.70 and 0.98
  const confidence = Math.min(0.98, Math.max(0.72, Number((0.70 + highestScore * 0.04).toFixed(2))));

  // Sort alternates
  scoredList.sort((a, b) => b.score - a.score);
  const alternates = scoredList
    .slice(1, 4)
    .map((item) => ({ name: item.dept.department, code: item.dept.code, category: item.dept.category }));

  return {
    department: bestMatch.department,
    code: bestMatch.code,
    confidence,
    reasoning: `Matches high-priority public service domain for ${bestMatch.category} based on keywords and jurisdiction.`,
    alternateDepartments: alternates,
  };
}
