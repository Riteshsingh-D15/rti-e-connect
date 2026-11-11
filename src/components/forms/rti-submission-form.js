"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  FileCheck,
  FileText,
  IndianRupee,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { rtiSubmissionSchema } from "@/validations/application";
import { RTI_TEMPLATES, findRtiTemplateBySlug } from "@/lib/rti-templates";
import { Alert, Card } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { formatDate } from "@/lib/utils";

const DRAFT_STORAGE_KEY = "rti_e_connect_draft_v1";

const STEPS = [
  { id: 1, title: "Applicant Details", subtitle: "Contact & jurisdiction" },
  { id: 2, title: "RTI Request & AI Check", subtitle: "Subject, dept & urgency" },
  { id: 3, title: "Evidence Upload", subtitle: "Optional documents" },
  { id: 4, title: "Review & Submit", subtitle: "Legal declaration" },
];

const FALLBACK_DEPARTMENTS = [
  "Public Works Department",
  "Department of Education",
  "Ministry of Health and Family Welfare",
  "Power and Electricity Department",
  "Water Supply and Sanitation",
  "Transport Department",
  "Municipal Corporation",
  "Home Department / Police",
  "Revenue and Land Records",
];

const LANGUAGES = ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Bengali", "Gujarati", "Kannada"];

export default function RTISubmissionForm({ initialTemplateSlug = "" }) {
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState(FALLBACK_DEPARTMENTS);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isLifeOrLiberty, setIsLifeOrLiberty] = useState(false);
  const [isBplExempt, setIsBplExempt] = useState(false);
  const [aiQuality, setAiQuality] = useState(null);
  const [checkingQuality, setCheckingQuality] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedApp, setSubmittedApp] = useState(null);
  const [activeTemplateLabel, setActiveTemplateLabel] = useState("");
  const [savedDraft, setSavedDraft] = useState(null);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(rtiSubmissionSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobileNumber: "",
      address: "",
      state: "Maharashtra",
      district: "",
      subject: "",
      question: "",
      governmentType: "State Government",
      department: "Public Works Department",
      publicAuthority: "Office of the Chief Executive Engineer, Public Works Dept.",
      preferredLanguage: "English",
      declarationConfirmed: false,
    },
  });

  const watched = useWatch({ control });

  const applyTemplate = useCallback(
    (tpl) => {
      if (!tpl) return;
      setValue("subject", tpl.subject, { shouldValidate: true });
      setValue("question", tpl.question, { shouldValidate: true });
      setValue("governmentType", tpl.governmentType, { shouldValidate: true });
      setValue("department", tpl.department, { shouldValidate: true });
      setValue("publicAuthority", tpl.publicAuthority, { shouldValidate: true });
      setActiveTemplateLabel(tpl.title);
      setAiQuality(null);
    },
    [setValue]
  );

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const [profileRes, deptRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/departments"),
        ]);

        if (active && profileRes.ok) {
          const p = await profileRes.json();
          if (p.name) setValue("fullName", p.name);
          if (p.email) setValue("email", p.email);
          if (p.phone) setValue("mobileNumber", p.phone);
          if (p.address) setValue("address", p.address);
          if (p.state) setValue("state", p.state);
          if (p.district) setValue("district", p.district);
          if (p.preferredLanguage) setValue("preferredLanguage", p.preferredLanguage);
        }

        if (active && deptRes.ok) {
          const list = await deptRes.json();
          if (Array.isArray(list) && list.length > 0) {
            setDepartments(list.map((d) => d.name));
          }
        }

        if (!active) return;

        const tpl = findRtiTemplateBySlug(initialTemplateSlug);
        if (tpl) {
          applyTemplate(tpl);
        } else if (typeof window !== "undefined") {
          try {
            const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed?.subject || parsed?.question) {
                setSavedDraft(parsed);
              }
            }
          } catch {
            // Ignore malformed local draft
          }
        }
      } catch {
        // Fallback defaults remain usable
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [setValue, initialTemplateSlug, applyTemplate]);

  useEffect(() => {
    if (submittedApp || typeof window === "undefined") return;
    if (!watched.subject && !watched.question) return;
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            subject: watched.subject || "",
            question: watched.question || "",
            governmentType: watched.governmentType || "State Government",
            department: watched.department || "",
            publicAuthority: watched.publicAuthority || "",
            preferredLanguage: watched.preferredLanguage || "English",
            isLifeOrLiberty,
            isBplExempt,
          })
        );
      } catch {
        // Ignore storage quota errors
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [
    submittedApp,
    watched.subject,
    watched.question,
    watched.governmentType,
    watched.department,
    watched.publicAuthority,
    watched.preferredLanguage,
    isLifeOrLiberty,
    isBplExempt,
  ]);

  const handleNextStep = async () => {
    setSubmitError("");
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ["fullName", "email", "mobileNumber", "address", "state", "district"];
    } else if (step === 2) {
      fieldsToValidate = [
        "subject",
        "question",
        "governmentType",
        "department",
        "publicAuthority",
        "preferredLanguage",
      ];
    }

    if (fieldsToValidate.length > 0) {
      const ok = await trigger(fieldsToValidate);
      if (!ok) return;
    }

    setStep((prev) => Math.min(4, prev + 1));
  };

  const handleRunQualityCheck = async () => {
    setUploadError("");
    const subjectOk = await trigger(["subject", "question"]);
    if (!subjectOk) return;

    setCheckingQuality(true);
    try {
      const res = await fetch("/api/ai/quality-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: watched.subject,
          question: watched.question,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiQuality(data);
      }
    } catch {
      // ignore transient AI failure
    } finally {
      setCheckingQuality(false);
    }
  };

  const applyRecommendedDepartment = (deptName) => {
    if (!deptName) return;
    if (!departments.includes(deptName)) {
      setDepartments((prev) => [...prev, deptName]);
    }
    setValue("department", deptName, { shouldValidate: true });
    setValue("publicAuthority", `Public Information Officer, ${deptName}`, {
      shouldValidate: true,
    });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadError("");
    setUploading(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          setUploadError(data.error || `Failed to upload ${file.name}`);
          continue;
        }
        if (data.document) {
          setDocuments((prev) => [...prev, data.document]);
        }
      }
    } catch {
      setUploadError("Network error while uploading supporting document.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeDocument = (docId) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const onSubmit = async (formData) => {
    setSubmitError("");
    try {
      const payload = {
        ...formData,
        isLifeOrLiberty,
        isBplExempt,
        documents,
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Unable to submit RTI application. Please check all fields.");
        return;
      }

      setSubmittedApp(data.application);
      setSavedDraft(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch {
      setSubmitError("Unable to reach the server to file your RTI. Please try again.");
    }
  };

  const handleRestoreDraft = () => {
    if (!savedDraft) return;
    if (savedDraft.subject) setValue("subject", savedDraft.subject, { shouldValidate: true });
    if (savedDraft.question) setValue("question", savedDraft.question, { shouldValidate: true });
    if (savedDraft.governmentType) setValue("governmentType", savedDraft.governmentType);
    if (savedDraft.department) setValue("department", savedDraft.department);
    if (savedDraft.publicAuthority) setValue("publicAuthority", savedDraft.publicAuthority);
    if (savedDraft.preferredLanguage) setValue("preferredLanguage", savedDraft.preferredLanguage);
    setIsLifeOrLiberty(Boolean(savedDraft.isLifeOrLiberty));
    setIsBplExempt(Boolean(savedDraft.isBplExempt));
    setSavedDraft(null);
    setStep(2);
  };

  const handleDiscardDraft = () => {
    setSavedDraft(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  };

  const handleReset = () => {
    setSubmittedApp(null);
    setAiQuality(null);
    setDocuments([]);
    setIsLifeOrLiberty(false);
    setIsBplExempt(false);
    setActiveTemplateLabel("");
    setSavedDraft(null);
    setStep(1);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    reset({
      ...watched,
      subject: "",
      question: "",
      declarationConfirmed: false,
    });
  };

  if (submittedApp) {
    return (
      <Card className="p-6 sm:p-8 max-w-3xl mx-auto space-y-6 border-emerald-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Section 6(1) RTI Filing Registered
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#102A43] mt-0.5">
                Application Successfully Submitted
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-xl bg-[#102A43] text-white text-right shadow-md">
              <p className="text-[10px] uppercase tracking-wider text-slate-300">Reference Number</p>
              <p className="text-base font-bold font-mono text-[#F59E0B]">
                {submittedApp.referenceNumber}
              </p>
            </div>
            <CopyButton value={submittedApp.referenceNumber} label="Copy Ref" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200">
            <p className="text-[11px] font-medium text-slate-500">Assigned Department</p>
            <p className="text-sm font-bold text-[#102A43] mt-1">{submittedApp.department}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200">
            <p className="text-[11px] font-medium text-slate-500">AI Predicted Category</p>
            <p className="text-sm font-bold text-[#102A43] mt-1">{submittedApp.category}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200">
            <p className="text-[11px] font-medium text-slate-500">Statutory Deadline</p>
            <p className="text-sm font-bold text-[#2563EB] mt-1">
              {formatDate(submittedApp.deadlineDate)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200">
            <p className="text-[11px] font-medium text-slate-500">Statutory Fee</p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {submittedApp.isBplExempt ? "Exempt (BPL)" : `₹${submittedApp.feeAmount || 10} Paid`}
            </p>
          </div>
        </div>

        <Alert type="info" title="What Happens Next?">
          Your RTI request has been automatically indexed and routed to{" "}
          <strong>{submittedApp.publicAuthority}</strong>. The assigned Public Information Officer (
          <strong>{submittedApp.assignedOfficerName}</strong>) will review your request and respond
          before the statutory deadline.
        </Alert>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/citizen/track?ref=${encodeURIComponent(submittedApp.referenceNumber)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors"
            >
              Track Application Live
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/citizen/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
          <Button type="button" variant="ghost" onClick={handleReset}>
            Submit Another RTI
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {activeTemplateLabel && (
        <Alert type="info" title={`Template Pre-Filled: ${activeTemplateLabel}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              Your RTI subject, department &amp; Section 6(1) wording have been pre-loaded in Step
              2.
            </span>
            {step === 1 && (
              <Button type="button" size="sm" variant="default" onClick={handleNextStep}>
                Jump to Step 2 Details <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </Alert>
      )}

      {savedDraft && !activeTemplateLabel && (
        <Alert type="warning" title="Unsaved RTI Draft Recovered">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              You have an unfinished RTI draft{savedDraft.subject ? ` (“${savedDraft.subject}”)` : ""}
              . Would you like to restore it?
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="navy" onClick={handleRestoreDraft}>
                <RotateCcw className="w-3.5 h-3.5" /> Resume Draft
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={handleDiscardDraft}>
                Discard
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Visual 4-Step Progress Bar */}
      <Card className="p-4 sm:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STEPS.map((s) => {
            const done = step > s.id;
            const current = step === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (s.id < step) setStep(s.id);
                }}
                disabled={s.id > step}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  current
                    ? "bg-[#EFF6FF] border-[#2563EB] ring-2 ring-[#2563EB]/15"
                    : done
                    ? "bg-emerald-50/70 border-emerald-200 cursor-pointer hover:bg-emerald-50"
                    : "bg-slate-50 border-slate-200 opacity-70 cursor-not-allowed"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    done
                      ? "bg-emerald-600 text-white"
                      : current
                      ? "bg-[#2563EB] text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#102A43] truncate">{s.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{s.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {submitError && (
        <Alert type="error" title="Submission Could Not Complete">
          {submitError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6 sm:p-8 space-y-6">
          {/* STEP 1: APPLICANT DETAILS */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#102A43]">Step 1: Applicant Details</h2>
                <p className="text-sm text-slate-500">
                  Prefilled from your Citizen Profile. Update fields if filing from a different
                  communication address.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("fullName")}
                    placeholder="Citizen Full Name"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="citizen@example.com"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Mobile Number (10 digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("mobileNumber")}
                    maxLength={10}
                    placeholder="9876543210"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  {errors.mobileNumber && (
                    <p className="text-xs text-red-600 mt-1">{errors.mobileNumber.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("state")}
                      placeholder="Maharashtra"
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                    {errors.state && (
                      <p className="text-xs text-red-600 mt-1">{errors.state.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      District <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("district")}
                      placeholder="Pune"
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                    {errors.district && (
                      <p className="text-xs text-red-600 mt-1">{errors.district.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Postal Address for Official Communication <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register("address")}
                    rows={2}
                    placeholder="House/Flat No, Street, Locality, PIN Code"
                    className="w-full p-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  {errors.address && (
                    <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: RTI DETAILS & AI QUALITY CHECK */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#102A43]">
                    Step 2: RTI Request & Department Routing
                  </h2>
                  <p className="text-sm text-slate-500">
                    Specify precise information points. Use AI Quality Check for clarity &
                    department recommendations.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="saffron"
                  size="sm"
                  onClick={handleRunQualityCheck}
                  disabled={checkingQuality}
                  className="gap-1.5 shrink-0"
                >
                  {checkingQuality ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {checkingQuality ? "Analyzing..." : "AI Quality & Dept Check"}
                </Button>
              </div>

              {/* Citizen-Friendly Section 6(1) Sample Templates */}
              <div className="rounded-xl border border-slate-200/90 bg-[#F4F7FB] p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Quick Fill Templates (Click to insert legal Section 6(1) phrasing)
                  </span>
                  {activeTemplateLabel ? (
                    <span className="text-[11px] font-semibold text-[#2563EB]">
                      Loaded: {activeTemplateLabel}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {RTI_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.slug}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        activeTemplateLabel === tpl.title
                          ? "bg-[#102A43] text-white border-[#102A43] shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>

              {aiQuality && (
                <div className="p-4 rounded-xl bg-[#EFF6FF] border border-blue-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-[#2563EB]" />
                      <span className="text-sm font-bold text-[#102A43]">
                        AI Clarity Score: {aiQuality.readinessScore}/100 ({aiQuality.status})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => applyRecommendedDepartment(aiQuality.recommendedDepartment)}
                    >
                      Use Suggested: {aiQuality.recommendedDepartment}
                    </Button>
                  </div>

                  <p className="text-xs text-slate-700">
                    Predicted Category: <strong>{aiQuality.predictedCategory}</strong> · AI
                    Confidence: <strong>{aiQuality.confidence}%</strong>
                  </p>

                  {Array.isArray(aiQuality.suggestions) && aiQuality.suggestions.length > 0 && (
                    <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4">
                      {aiQuality.suggestions.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Application Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("subject")}
                    placeholder="e.g., Certified copies of road repair tender and billing details for Ward 14"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  {errors.subject && (
                    <p className="text-xs text-red-600 mt-1">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Specific Information Requested (Section 6(1)) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register("question")}
                    rows={5}
                    placeholder="State numbered, factual questions clearly specifying dates, ward/office names, and document records requested..."
                    className="w-full p-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.question ? (
                      <p className="text-xs text-red-600">{errors.question.message}</p>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Minimum 20 characters. Specific date ranges improve response speed.
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-mono">
                      {watched.question?.length || 0} chars
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Government Jurisdiction <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("governmentType")}
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                      <option value="State Government">State Government</option>
                      <option value="Central Government">Central Government</option>
                      <option value="Urban Local Body / Municipal">Urban Local Body / Municipal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("department")}
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Public Authority Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("publicAuthority")}
                      placeholder="Specific office / authority"
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                    {errors.publicAuthority && (
                      <p className="text-xs text-red-600 mt-1">{errors.publicAuthority.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Preferred Response Language <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("preferredLanguage")}
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Statutory Special Provisions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      isLifeOrLiberty
                        ? "bg-amber-50 border-amber-300 ring-1 ring-amber-300"
                        : "bg-slate-50 border-slate-200 hover:bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isLifeOrLiberty}
                      onChange={(e) => setIsLifeOrLiberty(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-[#D97706]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                        <span className="text-sm font-bold text-[#102A43]">
                          Life or Liberty (48h Proviso)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Invoke Section 7(1) urgent disposal when information concerns immediate life
                        or personal liberty.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      isBplExempt
                        ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300"
                        : "bg-slate-50 border-slate-200 hover:bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isBplExempt}
                      onChange={(e) => setIsBplExempt(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-emerald-600"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="w-4 h-4 text-emerald-700" />
                        <span className="text-sm font-bold text-[#102A43]">
                          BPL Fee Exemption (Sec 7(5))
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Below Poverty Line cardholders pay ₹0 statutory application fee. Attach BPL
                        card proof in Step 3.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DOCUMENT UPLOAD */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#102A43]">
                  Step 3: Supporting Documents (Optional)
                </h2>
                <p className="text-sm text-slate-500">
                  Attach prior letters, BPL certificate, ID proof, or reference receipts (PDF, DOCX,
                  JPG, PNG up to 5 MB each).
                </p>
              </div>

              {uploadError && (
                <Alert type="error" title="Upload Error">
                  {uploadError}
                </Alert>
              )}

              <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-300 bg-[#F4F7FB] hover:bg-blue-50/40 hover:border-[#2563EB] transition-all cursor-pointer text-center">
                {uploading ? (
                  <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin mb-3" />
                ) : (
                  <UploadCloud className="w-10 h-10 text-[#2563EB] mb-3" />
                )}
                <p className="text-sm font-semibold text-[#102A43]">
                  {uploading ? "Uploading document securely..." : "Click to select PDF, DOCX, JPG or PNG files"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Stored securely for Public Information Officer verification & OCR processing
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {documents.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Attached Evidence ({documents.length})
                  </p>
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#102A43] truncate">
                              {doc.fileName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {Math.max(1, Math.round((doc.fileSize || 1024) / 1024))} KB ·{" "}
                              <span className="text-emerald-700 font-medium">{doc.ocrStatus}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-[#2563EB] hover:underline px-2 py-1"
                            >
                              Preview
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => removeDocument(doc.id)}
                            aria-label={`Remove ${doc.fileName}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: FINAL REVIEW & DECLARATION */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#102A43]">
                  Step 4: Final Review & Statutory Declaration
                </h2>
                <p className="text-sm text-slate-500">
                  Verify all particulars before generating your official RTI reference number.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#F4F7FB] border border-slate-200 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Applicant Particulars
                  </p>
                  <p className="text-sm font-semibold text-[#102A43]">{watched.fullName}</p>
                  <p className="text-xs text-slate-600">
                    {watched.email} · {watched.mobileNumber}
                  </p>
                  <p className="text-xs text-slate-600">
                    {watched.address}, {watched.district}, {watched.state}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F4F7FB] border border-slate-200 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Routing & Fee Summary
                  </p>
                  <p className="text-sm font-semibold text-[#102A43]">{watched.department}</p>
                  <p className="text-xs text-slate-600">
                    {watched.governmentType} · {watched.publicAuthority}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                      Lang: {watched.preferredLanguage}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isLifeOrLiberty
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      SLA: {isLifeOrLiberty ? "48 Hours (Life & Liberty)" : "30 Days Standard"}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Fee: {isBplExempt ? "₹0 (BPL Exempt)" : "₹10 Statutory Fee"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                  RTI Request Text
                </div>
                <p className="text-sm font-bold text-[#102A43]">{watched.subject}</p>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {watched.question}
                </p>
                {documents.length > 0 && (
                  <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                    Attached files: {documents.map((d) => d.fileName).join(", ")}
                  </p>
                )}
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/70 border border-blue-200 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("declarationConfirmed")}
                  className="mt-1 w-4 h-4 accent-[#2563EB]"
                />
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <span className="font-bold text-[#102A43] inline-flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-[#2563EB]" /> Statutory Citizen Declaration:
                  </span>{" "}
                  I hereby declare that I am a citizen of India under Section 3 of the RTI Act,
                  2005, and that all details furnished in this application are true and accurate to
                  the best of my knowledge.
                </div>
              </label>
              {errors.declarationConfirmed && (
                <p className="text-xs font-medium text-red-600">
                  {errors.declarationConfirmed.message}
                </p>
              )}
            </div>
          )}

          {/* Footer Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div>
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                  className="gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous Step
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {step < 4 ? (
                <Button
                  type="button"
                  variant="default"
                  onClick={handleNextStep}
                  className="gap-1.5"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="navy"
                  disabled={isSubmitting}
                  className="gap-2 px-6 font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting RTI...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                      Submit RTI Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
