import {
  addApplication as storeAddApp,
  updateApplication as storeUpdateApp,
  getApplicationById,
  getApplicationByReference,
  listApplications,
  addAuditLog,
  addNotification,
  getSystemConfig,
} from "../../lib/data-store.js";
import { categorizeRTI } from "../ai/categorize.js";
import { generateEmbedding } from "../ai/embeddings.js";
import { recommendDepartment } from "../ai/department.js";

/**
 * Generates an official RTI Reference Number adhering to government formatting standards.
 * Example: RTI-2026-PWD-4821
 */
export function generateReferenceNumber(deptCode = "GEN") {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `RTI-${year}-${deptCode.toUpperCase()}-${random}`;
}

/**
 * Submits an RTI Application, automatically triggers AI categorization,
 * records initial status history, and dispatches in-app notifications.
 */
export async function submitRTIApplication(data, citizenUser) {
  // 1. Run AI categorization & department recommendation
  const aiResult = await categorizeRTI(data.subject, data.question);
  const sysConfig = await getSystemConfig();

  // 2. Derive department code
  const targetDept = data.department || aiResult.department;
  const deptCode = targetDept.includes("Public Works")
    ? "PWD"
    : targetDept.includes("Education")
    ? "EDU"
    : targetDept.includes("Health")
    ? "HLT"
    : targetDept.includes("Power") || targetDept.includes("Electricity")
    ? "ELEC"
    : targetDept.includes("Water")
    ? "WAT"
    : targetDept.includes("Transport")
    ? "TRN"
    : targetDept.includes("Police") || targetDept.includes("Home")
    ? "POL"
    : targetDept.includes("Revenue")
    ? "REV"
    : "GEN";

  const referenceNumber = generateReferenceNumber(deptCode);

  // 3. Compute statutory response deadline (RTI Act Section 7(1): 30 days or 48h for Life & Liberty)
  const filingDate = new Date();
  const deadlineDate = new Date(filingDate);
  const isLifeOrLiberty = Boolean(data.isLifeOrLiberty);
  if (isLifeOrLiberty) {
    const hours = Number(sysConfig?.lifeLibertyDeadlineHours) || 48;
    deadlineDate.setHours(filingDate.getHours() + hours);
  } else {
    const days = Number(sysConfig?.statutoryDeadlineDays) || 30;
    deadlineDate.setDate(filingDate.getDate() + days);
  }

  // 4. Build application object
  const newApp = {
    id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    referenceNumber,
    citizenId: citizenUser.id || "user-citizen-1",
    citizenName: citizenUser.name || data.fullName,
    citizenEmail: citizenUser.email || data.email,
    citizenMobile: data.mobileNumber || "9876543210",
    citizenAddress: data.address || "",
    citizenState: data.state || "",
    citizenDistrict: data.district || "",
    subject: data.subject,
    question: data.question,
    category: aiResult.category,
    department: targetDept,
    governmentType: data.governmentType || "State Government",
    publicAuthority: data.publicAuthority || `${targetDept} Head Office`,
    preferredLanguage: data.preferredLanguage || "English",
    isLifeOrLiberty,
    isBplExempt: Boolean(data.isBplExempt),
    feeAmount: data.isBplExempt ? 0 : Number(sysConfig?.defaultFeeAmount ?? 10),
    status: "Submitted",
    filingDate: filingDate.toISOString(),
    deadlineDate: deadlineDate.toISOString(),
    internalNotes: isLifeOrLiberty
      ? "URGENT: Filed under Section 7(1) Life or Liberty Proviso (48-hour mandatory disposal). Priority scrutiny required."
      : "Awaiting administrative scrutinisation and allocation to designated PIO.",
    assignedOfficerId: "user-officer-1",
    assignedOfficerName: "Rakesh Verma",
    feePaid: true,
    createdAt: filingDate.toISOString(),
    updatedAt: filingDate.toISOString(),
    documents: data.documents || [],
    aiAnalysis: {
      predictedCategory: aiResult.category,
      confidence: aiResult.confidence,
      recommendedDepartment: aiResult.department,
      summary: aiResult.summary,
      keywords: aiResult.keywords,
      reasoning: aiResult.reason,
      provider: aiResult.provider,
      isSimulated: aiResult.isSimulated,
      isOverridden: false,
      createdAt: filingDate.toISOString(),
    },
    statusHistory: [
      {
        id: `sh-${Date.now()}-1`,
        status: "Submitted",
        remarks: "RTI application filed successfully through online portal with statutory fee verification.",
        updatedBy: citizenUser.name || "Citizen",
        createdAt: filingDate.toISOString(),
      },
      {
        id: `sh-${Date.now()}-2`,
        status: "AI Analysis",
        remarks: `AI Engine classified request as '${aiResult.category}' (Confidence: ${(aiResult.confidence * 100).toFixed(0)}%). Recommended department: ${aiResult.department}.`,
        updatedBy: "AI Classifier",
        createdAt: new Date(Date.now() + 100).toISOString(),
      },
      {
        id: `sh-${Date.now()}-3`,
        status: "Officer Assigned",
        remarks: "Auto-routed to Public Information Officer Rakesh Verma for administrative review.",
        updatedBy: "Nodal Routing Desk",
        createdAt: new Date(Date.now() + 200).toISOString(),
      },
    ],
  };

  // 5. Save to data store
  await storeAddApp(newApp);

  // 6. Audit log
  await addAuditLog({
    userId: citizenUser.id || "user-citizen-1",
    userName: citizenUser.name || "Citizen",
    action: "SUBMIT_RTI",
    entityType: "RTIApplication",
    entityId: newApp.id,
    details: `Filed RTI ${referenceNumber}: ${data.subject.slice(0, 60)}...`,
    ipAddress: "127.0.0.1",
  });

  // 7. Notify Citizen
  await addNotification({
    userId: newApp.citizenId,
    title: "RTI Application Filed Successfully",
    message: `Your RTI application has been registered with Reference Number ${referenceNumber}. Statutory reply deadline is 30 days.`,
    type: "success",
    link: `/citizen/track?ref=${referenceNumber}`,
  });

  // 8. Notify Officer
  await addNotification({
    userId: "user-officer-1",
    title: "New RTI Application Assigned",
    message: `Application ${referenceNumber} (${aiResult.category}) has been assigned to your desk.`,
    type: "info",
    link: `/officer/applications`,
  });

  return newApp;
}

/**
 * Updates application status, adds status history entry, and notifies citizen.
 */
export async function updateApplicationStatus(id, newStatus, remarks, officerUser) {
  const app = await getApplicationById(id);
  if (!app) throw new Error("Application not found");

  const newHistoryEntry = {
    id: `sh-${Date.now()}`,
    status: newStatus,
    remarks: remarks || `Status transitioned to ${newStatus}.`,
    updatedBy: officerUser.name || "Government Officer",
    createdAt: new Date().toISOString(),
  };

  const updated = await storeUpdateApp(id, {
    status: newStatus,
    statusHistory: [...(app.statusHistory || []), newHistoryEntry],
  });

  // Audit log
  await addAuditLog({
    userId: officerUser.id,
    userName: officerUser.name,
    action: "UPDATE_STATUS",
    entityType: "RTIApplication",
    entityId: id,
    details: `Status updated to ${newStatus}. Remarks: ${remarks || "None"}`,
  });

  // Notify Citizen
  await addNotification({
    userId: app.citizenId,
    title: `RTI Status Updated: ${newStatus}`,
    message: `Your application ${app.referenceNumber} is now marked as '${newStatus}'. Remarks: ${remarks || "Under official processing."}`,
    type: newStatus === "Response Sent" ? "success" : "info",
    link: `/citizen/track?ref=${app.referenceNumber}`,
  });

  return updated;
}
