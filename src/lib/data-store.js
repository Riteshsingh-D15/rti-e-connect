import fs from "fs/promises";
import path from "path";
import { getWritableDataDir, SEED_DATA_DIR } from "@/lib/storage-paths";

const SEED_STORE_FILE = path.join(/*turbopackIgnore: true*/ SEED_DATA_DIR, "mock-store.json");
let memoryStore = null;

function getStorePaths() {
  const dataDir = getWritableDataDir();
  return {
    dataDir,
    storeFile: path.join(/*turbopackIgnore: true*/ dataDir, "mock-store.json"),
  };
}

// Default seeded state
const defaultStore = {
  users: [
    {
      id: "user-citizen-1",
      name: "Ananya Sharma",
      email: "citizen@example.com",
      passwordHash: "$2b$10$L9JZ/zwq2O7.Vsoth3IMQ.uDRouUSrbh23gFRqxjtWwwD.WJ2L.B6", // password123
      role: "CITIZEN",
      phone: "9876543210",
      state: "Delhi",
      district: "New Delhi",
      address: "142, Barakhamba Road, Connaught Place",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "user-officer-1",
      name: "Rakesh Verma",
      email: "officer@example.com",
      passwordHash: "$2b$10$L9JZ/zwq2O7.Vsoth3IMQ.uDRouUSrbh23gFRqxjtWwwD.WJ2L.B6", // password123
      role: "GOVERNMENT OFFICER",
      phone: "9811223344",
      state: "Delhi",
      district: "Central Delhi",
      designation: "Public Information Officer (PIO)",
      department: "Public Works Department",
      employeeId: "GOV-PIO-8492",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "user-admin-1",
      name: "Meera Nair",
      email: "admin@example.com",
      passwordHash: "$2b$10$L9JZ/zwq2O7.Vsoth3IMQ.uDRouUSrbh23gFRqxjtWwwD.WJ2L.B6", // password123
      role: "ADMINISTRATOR",
      phone: "9988776655",
      state: "Delhi",
      district: "New Delhi",
      designation: "Chief RTI Portal Administrator",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  departments: [
    { id: "dept-1", name: "Public Works Department", code: "PWD", isStateLevel: true, contactEmail: "pio.pwd@gov.in" },
    { id: "dept-2", name: "Education Department", code: "EDU", isStateLevel: true, contactEmail: "pio.edu@gov.in" },
    { id: "dept-3", name: "Health and Family Welfare Department", code: "HLT", isStateLevel: true, contactEmail: "pio.health@gov.in" },
    { id: "dept-4", name: "Electricity and Power Department", code: "ELEC", isStateLevel: true, contactEmail: "pio.power@gov.in" },
    { id: "dept-5", name: "Water Supply and Sanitation Department", code: "WAT", isStateLevel: true, contactEmail: "pio.water@gov.in" },
    { id: "dept-6", name: "Transport Department", code: "TRN", isStateLevel: true, contactEmail: "pio.transport@gov.in" },
    { id: "dept-7", name: "Municipal Administration and Urban Development", code: "MUN", isStateLevel: true, contactEmail: "pio.urban@gov.in" },
    { id: "dept-8", name: "Home / Police Department", code: "POL", isStateLevel: true, contactEmail: "pio.police@gov.in" },
    { id: "dept-9", name: "Revenue and Land Records Department", code: "REV", isStateLevel: true, contactEmail: "pio.revenue@gov.in" },
  ],
  publicAuthorities: [
    { id: "pa-1", name: "Central Public Works Department (CPWD)", departmentId: "dept-1", code: "CPWD-HQ" },
    { id: "pa-2", name: "Directorate of Education, Govt of NCT", departmentId: "dept-2", code: "DOE-DEL" },
    { id: "pa-3", name: "Municipal Corporation Public Health Wing", departmentId: "dept-3", code: "MCD-PH" },
    { id: "pa-4", name: "State Electricity Regulatory Commission", departmentId: "dept-4", code: "SERC-DL" },
  ],
  applications: [
    {
      id: "app-1",
      referenceNumber: "RTI-2026-PWD-4821",
      citizenId: "user-citizen-1",
      citizenName: "Ananya Sharma",
      citizenEmail: "citizen@example.com",
      citizenMobile: "9876543210",
      subject: "Expenditure details of Outer Ring Road flyover resurfacing",
      question: "Provide certified copies of total funds sanctioned and expenditure incurred for the resurfacing of Outer Ring Road flyover between Jan 2024 and Dec 2024, along with contractor measurement book details.",
      department: "Public Works Department",
      category: "Public Infrastructure",
      governmentType: "State Government",
      publicAuthority: "Central Public Works Department (CPWD)",
      preferredLanguage: "English",
      status: "Under Review",
      filingDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      deadlineDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 23).toISOString(),
      internalNotes: "Verification requested from Assistant Engineer (Works Division IV). Tender file #PWD/2024/09.",
      assignedOfficerId: "user-officer-1",
      assignedOfficerName: "Rakesh Verma",
      feePaid: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      updatedAt: new Date().toISOString(),
      documents: [
        { id: "doc-1", fileName: "supporting_site_photographs.pdf", fileType: "application/pdf", fileSize: 245000, uploadedAt: new Date().toISOString() },
      ],
      aiAnalysis: {
        predictedCategory: "Public Infrastructure",
        confidence: 0.94,
        recommendedDepartment: "Public Works Department",
        summary: "Citizen request for audited road resurfacing expenditure and contractor measurement records.",
        keywords: ["Road Construction", "Flyover Resurfacing", "Expenditure", "Measurement Book"],
        reasoning: "The application explicitly concerns civil road infrastructure and municipal contract accounting.",
        isOverridden: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
      statusHistory: [
        { id: "sh-1", status: "Submitted", remarks: "RTI application received online and verified fee payment of ₹10.", updatedBy: "System", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
        { id: "sh-2", status: "AI Analysis", remarks: "Automated categorization and department recommendation completed.", updatedBy: "AI Engine", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
        { id: "sh-3", status: "Officer Assigned", remarks: "Allocated to PIO Rakesh Verma (Works & Infrastructure).", updatedBy: "Nodal Desk", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString() },
        { id: "sh-4", status: "Under Review", remarks: "Scrutiny of divisional accounts in progress.", updatedBy: "Rakesh Verma", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
      ],
    },
    {
      id: "app-2",
      referenceNumber: "RTI-2026-EDU-8193",
      citizenId: "user-citizen-1",
      citizenName: "Ananya Sharma",
      citizenEmail: "citizen@example.com",
      citizenMobile: "9876543210",
      subject: "Sanctioned teacher vacancies and classroom budget in Model Schools",
      question: "Provide details of allocated funds for government model school laboratory equipment and current vacant TGT/PGT teacher posts across New Delhi district for the academic session 2024-25.",
      department: "Education Department",
      category: "Education",
      governmentType: "State Government",
      publicAuthority: "Directorate of Education, Govt of NCT",
      preferredLanguage: "English",
      status: "Draft Prepared",
      filingDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      deadlineDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 16).toISOString(),
      internalNotes: "Teacher roster received from Establishment Branch. Lab equipment invoice summary attached.",
      assignedOfficerId: "user-officer-1",
      assignedOfficerName: "Rakesh Verma",
      feePaid: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      updatedAt: new Date().toISOString(),
      documents: [],
      aiAnalysis: {
        predictedCategory: "Education",
        confidence: 0.96,
        recommendedDepartment: "Education Department",
        summary: "Request for government school teacher vacancies and laboratory equipment budgetary records.",
        keywords: ["Education", "Teacher Vacancy", "Laboratory Budget", "Model Schools"],
        reasoning: "The application pertains directly to academic institutions, teacher recruitment and school grants.",
        isOverridden: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      },
      statusHistory: [
        { id: "sh-5", status: "Submitted", remarks: "Application received and acknowledged.", updatedBy: "System", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() },
        { id: "sh-6", status: "Officer Assigned", remarks: "Assigned to Education Desk.", updatedBy: "Admin", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString() },
        { id: "sh-7", status: "Draft Prepared", remarks: "AI assisted draft generated and reviewed with Establishment wing data.", updatedBy: "Rakesh Verma", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() },
      ],
      officialResponse: {
        id: "resp-2",
        subject: "Information supplied under Section 7(1) regarding Teacher Vacancies and Lab Grants",
        responseText: "Certified data regarding sanctioned laboratory grants for FY 2024-25 and status of vacant faculty positions is provided in accordance with official Directorate records.",
        pointWiseResponse: "1. Total sanctioned budget for laboratory modernization is ₹48,50,000 across 12 Model Schools in the district.\n2. Total vacant teaching posts: TGT (Science) - 8, PGT (Physics) - 3, PGT (Chemistry) - 2. Recruitment requisition is pending with DSSSB.\n3. Inspection of physical stock registers may be conducted on any working Friday.",
        legalProvisions: "RTI Act 2005: Section 6(1), Section 7(1), and Section 19(1).",
        status: "Draft",
        missingInfoFlag: false,
        approvedAt: null,
        sentAt: null,
      },
    },
    {
      id: "app-3",
      referenceNumber: "RTI-2026-HLT-2910",
      citizenId: "user-citizen-1",
      citizenName: "Ananya Sharma",
      citizenEmail: "citizen@example.com",
      citizenMobile: "9876543210",
      subject: "Generic medicine stock availability in District Sub-Divisional Hospital",
      question: "Provide list of essential generic medicines available and expired batches discarded in the sub-divisional hospital dispensary during Q3 2024.",
      department: "Health and Family Welfare Department",
      category: "Healthcare",
      governmentType: "State Government",
      publicAuthority: "Municipal Corporation Public Health Wing",
      preferredLanguage: "English",
      status: "Response Sent",
      filingDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
      deadlineDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      internalNotes: "Hospital Superintendent furnished verified stock list.",
      assignedOfficerId: "user-officer-1",
      assignedOfficerName: "Rakesh Verma",
      feePaid: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
      updatedAt: new Date().toISOString(),
      documents: [],
      statusHistory: [
        { id: "sh-8", status: "Submitted", remarks: "Filed online.", updatedBy: "System", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString() },
        { id: "sh-9", status: "Under Review", remarks: "Stock audit verified.", updatedBy: "Rakesh Verma", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString() },
        { id: "sh-10", status: "Response Sent", remarks: "Official signed response dispatched via portal and registered post.", updatedBy: "Rakesh Verma", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
      ],
      officialResponse: {
        id: "resp-3",
        subject: "Information provided regarding essential drug stock at Sub-Divisional Dispensary",
        responseText: "The complete inventory record of essential generic medicines as verified by the Chief Medical Officer is furnished herewith.",
        pointWiseResponse: "1. Total 84 essential generic formulations are currently in stock as per National Essential Medicines List (NEML).\n2. Total value of expired batches returned to Central Medical Store Depot for safe bio-destruction is ₹14,200.\n3. Daily stock register is publicly displayed at the OPD registration desk as per proactive disclosure mandates.",
        legalProvisions: "RTI Act 2005: Section 4(1)(b) and Section 7(1).",
        status: "Sent",
        missingInfoFlag: false,
        approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
    },
  ],
  historicalRecords: [
    {
      id: "hist-1",
      referenceNumber: "HIST-RTI-2023-PWD-019",
      subject: "Provide details of expenditure on public road and highway construction in District North",
      question: "Provide details of expenditure on public road construction, bitumen quality testing reports, and contractor payments for North District roads during FY 2022-23.",
      category: "Public Infrastructure",
      departmentName: "Public Works Department",
      approvedResponse: "The audited expenditure incurred on 18 road stretches under North District was ₹14.82 Crores. Quality assurance lab reports certified bitumen grade VG-30 in compliance with IRC:SP:84 specifications. Complete contractor bill measurement entries are enclosed in Annexure A.",
      legalReferences: ["RTI Act 2005 - Section 4(1)(b)", "RTI Act 2005 - Section 7(1)"],
      keywords: ["Road Construction", "Bitumen Testing", "Public Infrastructure", "Contractor Payment", "Expenditure"],
      createdAt: new Date("2023-08-15").toISOString(),
    },
    {
      id: "hist-2",
      referenceNumber: "HIST-RTI-2023-EDU-045",
      subject: "Provide details of expenditure on public school infrastructure and smart classroom equipment",
      question: "How much money was spent on building government schools, digital classroom boards, and student sanitation facilities in East Zone?",
      category: "Education",
      departmentName: "Education Department",
      approvedResponse: "Capital expenditure of ₹8.45 Crores was disbursed under the Samagra Shiksha Abhiyan for 42 government senior secondary schools in East Zone. Breakdown includes: 84 interactive flat panels (₹1.68 Cr), 18 toilet blocks refurbishment (₹94 Lakhs), and science laboratory retrofitting (₹2.1 Cr).",
      legalReferences: ["RTI Act 2005 - Section 7(1)", "RTI Act 2005 - Section 11(1)"],
      keywords: ["School Infrastructure", "Smart Classroom", "Expenditure", "Education Grants", "Sanitation"],
      createdAt: new Date("2023-11-20").toISOString(),
    },
    {
      id: "hist-3",
      referenceNumber: "HIST-RTI-2024-WAT-012",
      subject: "Pipeline layout and water purity test reports under Jal Jeevan Mission",
      question: "Provide water quality TDS test parameters and functional tap connection completion figures for Ward 14 under Jal Jeevan Mission.",
      category: "Water Supply",
      departmentName: "Water Supply and Sanitation Department",
      approvedResponse: "Under Jal Jeevan Mission Phase II, 3,420 household tap connections have been commissioned in Ward 14. Monthly bacteriological and chemical testing reports from the State Water Testing Laboratory confirmed potable parameters conforming to IS 10500:2012 standards.",
      legalReferences: ["RTI Act 2005 - Section 7(1)"],
      keywords: ["Jal Jeevan Mission", "Drinking Water", "Water Quality", "TDS Testing", "Pipeline"],
      createdAt: new Date("2024-02-10").toISOString(),
    },
    {
      id: "hist-4",
      referenceNumber: "HIST-RTI-2024-REV-088",
      subject: "Status of land mutation and Khasra survey demarcation in Tehsil Mehrauli",
      question: "Provide certified inspection extract of Khasra No 182/4 land title mutation register and pending demarcation applications since April 2023.",
      category: "Revenue and Land Records",
      departmentName: "Revenue and Land Records Department",
      approvedResponse: "Mutation in respect of Khasra No 182/4 was sanctioned vide Order No 491/Tehsildar/2023. Attested extract of the Jamabandi and Aksh-Shajra map demarcating parcel boundaries is supplied on payment of statutory inspection fees.",
      legalReferences: ["Delhi Land Revenue Rules", "RTI Act 2005 - Section 7(1)"],
      keywords: ["Land Records", "Khasra", "Jamabandi", "Mutation", "Tehsil"],
      createdAt: new Date("2024-05-18").toISOString(),
    },
    {
      id: "hist-5",
      referenceNumber: "HIST-RTI-2024-HLT-071",
      subject: "Primary Health Centre staffing sanction and medicine procurement budget",
      question: "Provide details of sanctioned vs posted medical officers in rural Primary Health Centres and emergency ambulance response times.",
      category: "Healthcare",
      departmentName: "Health and Family Welfare Department",
      approvedResponse: "Across 24 PHCs, 48 Medical Officer positions are sanctioned and 42 are currently filled with regular cadres. The average emergency response time of 108 ALS ambulances across the district recorded for the last quarter was 14.6 minutes.",
      legalReferences: ["RTI Act 2005 - Section 4(1)(b)", "RTI Act 2005 - Section 7(1)"],
      keywords: ["Primary Health Centre", "Medical Officer", "Ambulance Response", "Dispensary"],
      createdAt: new Date("2024-06-25").toISOString(),
    },
  ],
  appeals: [
    {
      id: "appeal-1",
      appealNumber: "APP-2026-0012",
      applicationId: "app-3",
      applicationReferenceNumber: "RTI-2026-HLT-2910",
      citizenId: "user-citizen-1",
      citizenName: "Ananya Sharma",
      groundOfAppeal: "Incomplete, misleading or false information provided",
      reliefSought: "Request inspection of batch testing laboratory certificates for expired drug disposals.",
      status: "Submitted",
      appellateOfficerName: "First Appellate Authority (Director Health)",
      decisionRemarks: null,
      hearingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
      filedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      resolvedAt: null,
    },
  ],
  notifications: [
    {
      id: "notif-1",
      userId: "user-citizen-1",
      title: "RTI Application Registered",
      message: "Your application RTI-2026-PWD-4821 has been submitted and assigned for review.",
      type: "success",
      link: "/citizen/track?ref=RTI-2026-PWD-4821",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    },
    {
      id: "notif-2",
      userId: "user-citizen-1",
      title: "Official Response Dispatched",
      message: "The PIO has issued an official response for RTI-2026-HLT-2910.",
      type: "info",
      link: "/citizen/track?ref=RTI-2026-HLT-2910",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
    {
      id: "notif-3",
      userId: "user-officer-1",
      title: "New RTI Assigned to Your Desk",
      message: "Application RTI-2026-PWD-4821 requires review. Statutory deadline: 23 days remaining.",
      type: "warning",
      link: "/officer/applications",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    },
  ],
  auditLogs: [
    {
      id: "audit-1",
      userId: "user-citizen-1",
      userName: "Ananya Sharma",
      action: "SUBMIT_RTI",
      entityType: "RTIApplication",
      entityId: "app-1",
      details: "Citizen submitted new RTI request for Outer Ring Road resurfacing.",
      ipAddress: "192.168.1.104",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    },
    {
      id: "audit-2",
      userId: "system",
      userName: "AI Classifier",
      action: "AI_CATEGORIZATION",
      entityType: "AIAnalysis",
      entityId: "app-1",
      details: "Categorized as Public Infrastructure with confidence 0.94. Recommended PWD.",
      ipAddress: "internal",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    },
    {
      id: "audit-3",
      userId: "user-officer-1",
      userName: "Rakesh Verma",
      action: "GENERATE_DRAFT_RESPONSE",
      entityType: "OfficialResponse",
      entityId: "resp-2",
      details: "Officer generated AI draft response for RTI-2026-EDU-8193.",
      ipAddress: "10.0.4.12",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    },
  ],
  systemConfig: {
    portalName: "RTI E CONNECT",
    tagline: "Transparency Through Technology",
    statutoryDeadlineDays: 30,
    lifeLibertyDeadlineHours: 48,
    firstAppealWindowDays: 30,
    defaultFeeAmount: 10,
    bplExempt: true,
    aiModelProvider: "Development Hybrid (Gemini / OpenAI Compatible)",
    enableOcr: true,
  },
};

export async function ensureStore() {
  const { dataDir, storeFile } = getStorePaths();
  try {
    await fs.mkdir(dataDir, { recursive: true });
    try {
      await fs.access(storeFile);
    } catch {
      let initialData = defaultStore;
      if (storeFile !== SEED_STORE_FILE) {
        try {
          const seedRaw = await fs.readFile(/*turbopackIgnore: true*/ SEED_STORE_FILE, "utf8");
          initialData = JSON.parse(seedRaw);
        } catch {
          initialData = defaultStore;
        }
      }
      memoryStore = structuredClone(initialData);
      await fs.writeFile(/*turbopackIgnore: true*/ storeFile, JSON.stringify(initialData, null, 2), "utf8");
    }
  } catch {
    if (!memoryStore) {
      memoryStore = structuredClone(defaultStore);
    }
  }
}

export async function readStore() {
  const { storeFile } = getStorePaths();
  await ensureStore();
  try {
    const file = await fs.readFile(/*turbopackIgnore: true*/ storeFile, "utf8");
    const parsed = JSON.parse(file);
    memoryStore = parsed;
    return parsed;
  } catch {
    if (!memoryStore) {
      memoryStore = structuredClone(defaultStore);
    }
    return memoryStore;
  }
}

export async function writeStore(nextStore) {
  const { storeFile } = getStorePaths();
  memoryStore = nextStore;
  await ensureStore();
  try {
    await fs.writeFile(/*turbopackIgnore: true*/ storeFile, JSON.stringify(nextStore, null, 2), "utf8");
  } catch {
    // Keep memoryStore updated even if serverless temp storage cannot be written
  }
  return nextStore;
}

// User Helpers
export async function getUserByEmail(email) {
  const store = await readStore();
  return store.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
}

export async function getUserById(id) {
  const store = await readStore();
  return store.users.find((u) => u.id === id) || null;
}

export async function addUser(user) {
  const store = await readStore();
  store.users.unshift(user);
  await writeStore(store);
  return user;
}

export async function updateUser(id, updates) {
  const store = await readStore();
  const idx = (store.users || []).findIndex((u) => u.id === id);
  if (idx === -1) return null;
  const { passwordHash: _ignored, id: _idIgnored, ...allowed } = updates;
  store.users[idx] = {
    ...store.users[idx],
    ...allowed,
    updatedAt: new Date().toISOString(),
  };
  await writeStore(store);
  const { passwordHash, ...safeUser } = store.users[idx];
  return safeUser;
}

export async function getUsers() {
  const store = await readStore();
  return store.users.map(({ passwordHash, ...rest }) => rest);
}

// Application Helpers
export async function listApplications(filters = {}) {
  const store = await readStore();
  let apps = store.applications || [];

  if (filters.citizenId) {
    apps = apps.filter((a) => a.citizenId === filters.citizenId);
  }
  if (filters.department) {
    apps = apps.filter((a) => a.department.toLowerCase() === filters.department.toLowerCase());
  }
  if (filters.status && filters.status !== "All") {
    apps = apps.filter((a) => a.status === filters.status);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    apps = apps.filter(
      (a) =>
        a.referenceNumber.toLowerCase().includes(q) ||
        a.subject.toLowerCase().includes(q) ||
        a.question.toLowerCase().includes(q)
    );
  }
  return apps;
}

export async function getApplicationById(id) {
  const store = await readStore();
  return store.applications.find((a) => a.id === id) || null;
}

export async function getApplicationByReference(referenceNumber) {
  const store = await readStore();
  return store.applications.find((a) => a.referenceNumber.toLowerCase() === referenceNumber.toLowerCase()) || null;
}

export async function addApplication(application) {
  const store = await readStore();
  store.applications.unshift(application);
  await writeStore(store);
  return application;
}

export async function updateApplication(id, updates) {
  const store = await readStore();
  const idx = store.applications.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  store.applications[idx] = {
    ...store.applications[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await writeStore(store);
  return store.applications[idx];
}

// Notification Helpers
export async function getNotifications(userId) {
  const store = await readStore();
  if (!userId) return store.notifications || [];
  return (store.notifications || []).filter((n) => n.userId === userId);
}

export async function addNotification(notification) {
  const store = await readStore();
  if (!store.notifications) store.notifications = [];
  store.notifications.unshift({
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    read: false,
    createdAt: new Date().toISOString(),
    ...notification,
  });
  await writeStore(store);
  return notification;
}

export async function markNotificationRead(id, userId = null) {
  const store = await readStore();
  const notif = (store.notifications || []).find((n) => n.id === id);
  if (!notif) return null;
  if (userId && notif.userId && notif.userId !== userId) return null;
  notif.read = true;
  await writeStore(store);
  return notif;
}

export async function markAllNotificationsRead(userId) {
  const store = await readStore();
  let updatedCount = 0;
  for (const n of store.notifications || []) {
    if ((!userId || n.userId === userId) && !n.read) {
      n.read = true;
      updatedCount += 1;
    }
  }
  if (updatedCount > 0) {
    await writeStore(store);
  }
  return updatedCount;
}

// Appeal Helpers
export async function listAppeals() {
  const store = await readStore();
  return store.appeals || [];
}

export async function addAppeal(appeal) {
  const store = await readStore();
  if (!store.appeals) store.appeals = [];
  store.appeals.unshift(appeal);
  await writeStore(store);
  return appeal;
}

export async function updateAppeal(id, updates) {
  const store = await readStore();
  const idx = (store.appeals || []).findIndex((a) => a.id === id);
  if (idx === -1) return null;
  store.appeals[idx] = {
    ...store.appeals[idx],
    ...updates,
    resolvedAt: updates.status === "Allowed" || updates.status === "Rejected" ? new Date().toISOString() : store.appeals[idx].resolvedAt,
  };
  await writeStore(store);
  return store.appeals[idx];
}

// Department Helpers
export async function getDepartments() {
  const store = await readStore();
  return store.departments || [];
}

export async function addDepartment(dept) {
  const store = await readStore();
  if (!store.departments) store.departments = [];
  store.departments.push(dept);
  await writeStore(store);
  return dept;
}

export async function deleteDepartment(id) {
  const store = await readStore();
  const before = (store.departments || []).length;
  store.departments = (store.departments || []).filter((d) => d.id !== id);
  if (store.departments.length === before) return false;
  await writeStore(store);
  return true;
}

// System Configuration Helpers
export async function getSystemConfig() {
  const store = await readStore();
  return store.systemConfig || defaultStore.systemConfig;
}

export async function updateSystemConfig(updates) {
  const store = await readStore();
  store.systemConfig = {
    ...(store.systemConfig || defaultStore.systemConfig),
    ...updates,
  };
  await writeStore(store);
  return store.systemConfig;
}

// Audit Log Helpers
export async function addAuditLog(log) {
  const store = await readStore();
  if (!store.auditLogs) store.auditLogs = [];
  store.auditLogs.unshift({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...log,
  });
  await writeStore(store);
}

export async function getAuditLogs() {
  const store = await readStore();
  return store.auditLogs || [];
}

// Analytics Aggregator
export async function getAnalyticsSummary() {
  const store = await readStore();
  const apps = store.applications || [];
  const appealsList = store.appeals || [];
  const now = Date.now();

  const total = apps.length;
  const pending = apps.filter((a) =>
    ["Submitted", "AI Analysis", "Department Identification", "Officer Assigned"].includes(a.status)
  ).length;
  const underReview = apps.filter((a) =>
    ["Under Review", "Awaiting Clarification", "Draft Prepared", "Awaiting Approval"].includes(a.status)
  ).length;
  const responded = apps.filter((a) => ["Response Sent", "Completed"].includes(a.status)).length;
  const appeals = appealsList.length;

  const overdueCount = apps.filter((a) => {
    if (["Response Sent", "Completed", "Withdrawn", "Rejected with Reason"].includes(a.status)) {
      return false;
    }
    return a.deadlineDate && new Date(a.deadlineDate).getTime() < now;
  }).length;

  // Compute real average processing / elapsed days
  let elapsedSum = 0;
  for (const a of apps) {
    const start = new Date(a.filingDate || a.createdAt).getTime();
    const end = a.officialResponse?.sentAt ? new Date(a.officialResponse.sentAt).getTime() : now;
    elapsedSum += Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
  }
  const avgProcessingTimeDays = total > 0 ? Number((elapsedSum / total).toFixed(1)) : 0;
  const statutoryComplianceRate =
    total > 0 ? Number((((total - overdueCount) / total) * 100).toFixed(1)) : 100;

  // Category breakdown
  const categoryCounts = {};
  for (const a of apps) {
    const cat = a.category || "Other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }
  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

  // Department breakdown (use short names for crisp chart labels)
  const departmentCounts = {};
  for (const a of apps) {
    const dept = (a.department || "General").replace(/\s+Department$/i, "");
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
  }
  const departmentData = Object.entries(departmentCounts).map(([name, count]) => ({ name, count }));

  // Monthly activity grouped from stored filings (sorted chronologically)
  const monthBuckets = {};
  for (const a of apps) {
    const d = new Date(a.filingDate || a.createdAt);
    const valid = !Number.isNaN(d.getTime());
    const key = valid
      ? d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
      : "Current";
    const sortTs = valid ? new Date(d.getFullYear(), d.getMonth(), 1).getTime() : 0;
    if (!monthBuckets[key]) {
      monthBuckets[key] = { month: key, applications: 0, resolved: 0, sortTs };
    }
    monthBuckets[key].applications += 1;
    if (["Response Sent", "Completed"].includes(a.status)) {
      monthBuckets[key].resolved += 1;
    }
  }
  const monthlyData = Object.values(monthBuckets)
    .sort((a, b) => a.sortTs - b.sortTs)
    .map(({ sortTs, ...rest }) => rest);

  // Average AI confidence per category
  const confBuckets = {};
  for (const a of apps) {
    const cat = a.aiAnalysis?.predictedCategory || a.category || "Other";
    const raw = Number(a.aiAnalysis?.confidence ?? a.aiAnalysis?.confidenceScore ?? 0.92);
    const pct = raw > 1 ? raw : Math.round(raw * 100);
    if (!confBuckets[cat]) confBuckets[cat] = { sum: 0, n: 0 };
    confBuckets[cat].sum += pct;
    confBuckets[cat].n += 1;
  }
  const aiConfidenceData = Object.entries(confBuckets).map(([name, b]) => ({
    name: name.length > 14 ? `${name.slice(0, 12)}…` : name,
    accuracy: Math.min(100, Math.round(b.sum / b.n)),
  }));

  return {
    total,
    pending,
    underReview,
    responded,
    appeals,
    overdueCount,
    categoryData,
    departmentData,
    monthlyData,
    aiConfidenceData,
    avgProcessingTimeDays,
    statutoryComplianceRate,
    serverNow: now,
  };
}
