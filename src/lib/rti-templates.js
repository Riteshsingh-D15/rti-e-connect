/**
 * Curated Section 6(1) RTI filing templates for common Indian citizen queries.
 * Shared between the interactive landing helper and the multi-step filing form.
 */

export const RTI_TEMPLATES = [
  {
    slug: "road-repair",
    badge: "Public Works",
    title: "Road Repair & Contractor Bills",
    department: "Public Works Department",
    governmentType: "State Government",
    publicAuthority: "Office of the Chief Executive Engineer, Public Works Dept.",
    subject: "Ward road repair work order, contractor billing & quality audit details",
    question:
      "Under Section 6(1) of the RTI Act, 2005, please provide: (1) Certified copy of the work order and sanctioned estimate for the road resurfacing work in Ward 14 during FY 2025-26; (2) Name of the awarded contractor and total billed amount released till date; (3) Inspection and third-party quality testing report prior to final bill clearance.",
    predictedCategory: "Public Infrastructure",
    slaDays: 30,
  },
  {
    slug: "ration-pds",
    badge: "Food & Civil Supplies",
    title: "Ration Card / PDS Allocation Delay",
    department: "Revenue and Land Records",
    governmentType: "State Government",
    publicAuthority: "District Food, Civil Supplies & Consumer Protection Officer",
    subject: "Reason for pending ration card verification & Fair Price Shop stock log",
    question:
      "Under Section 6(1) of the RTI Act, 2005, please furnish: (1) Current processing status and file notings for my pending BPL/Priority Ration Card renewal application; (2) Monthly foodgrain allotment and POS distribution register of Fair Price Shop No. 42 for the last 6 months; (3) Name and designation of the officer responsible for field verification.",
    predictedCategory: "Revenue and Land Records",
    slaDays: 30,
  },
  {
    slug: "hospital-stock",
    badge: "Healthcare",
    title: "Hospital Medicine Stock & Duty Roster",
    department: "Ministry of Health and Family Welfare",
    governmentType: "State Government",
    publicAuthority: "Medical Superintendent, District Civil Hospital",
    subject: "Essential drug availability ledger & emergency duty roster details",
    question:
      "Under Section 6(1) of the RTI Act, 2005, please provide: (1) Monthly stock register of essential life-saving medicines listed under the Free Drug Initiative for the past quarter; (2) Certified copy of the specialist doctor duty roster for the Emergency & Trauma Ward; (3) Details of diagnostic equipment currently out of service and dates of repair requests sent.",
    predictedCategory: "Healthcare",
    slaDays: 30,
  },
  {
    slug: "scholarship-status",
    badge: "Education",
    title: "Scholarship / Fee Reimbursement Status",
    department: "Department of Education",
    governmentType: "State Government",
    publicAuthority: "Directorate of Higher & Technical Education",
    subject: "Disbursement status & verification timeline for state merit scholarship",
    question:
      "Under Section 6(1) of the RTI Act, 2005, please provide: (1) Date-wise movement and current approval status of post-matric scholarship applications verified by our district for Academic Year 2025-26; (2) Total sanctioned budget vs actual DBT amount disbursed to student bank accounts so far; (3) Reason for delay if applications verified more than 45 days ago remain pending.",
    predictedCategory: "Education",
    slaDays: 30,
  },
];

export function findRtiTemplateBySlug(slug) {
  if (!slug) return null;
  return RTI_TEMPLATES.find((item) => item.slug === slug) || null;
}
