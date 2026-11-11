import { z } from "zod";

export const step1ApplicantSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Valid email required for official notifications"),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile number required (starting 6-9)"),
  address: z.string().min(5, "Postal address is required for communication"),
  state: z.string().min(2, "State / UT selection is mandatory"),
  district: z.string().min(2, "District is mandatory"),
});

export const step2RtiSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200, "Subject must be under 200 characters"),
  question: z.string().min(20, "Detailed question must be at least 20 characters").max(3000, "Maximum 3000 characters"),
  governmentType: z.enum(["Central Government", "State Government"]),
  department: z.string().min(2, "Department selection is mandatory"),
  publicAuthority: z.string().min(2, "Public authority name is mandatory"),
  preferredLanguage: z.enum(["English", "Hindi", "Regional Language"]),
});

export const rtiSubmissionSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/),
  address: z.string().min(5),
  state: z.string().min(2),
  district: z.string().min(2),
  subject: z.string().min(5),
  question: z.string().min(20),
  governmentType: z.string().min(2),
  department: z.string().min(2),
  publicAuthority: z.string().min(2),
  preferredLanguage: z.string().min(2),
  declarationConfirmed: z.boolean().refine((val) => val === true, "You must confirm the legal RTI declaration"),
});

export const appealSubmissionSchema = z.object({
  applicationId: z.string().min(1, "Original RTI application must be selected"),
  groundOfAppeal: z.enum([
    "Information refused or not provided within 30 days",
    "Unreasonable fee demanded by PIO",
    "Incomplete, misleading or false information provided",
    "Application improperly rejected under exemption section",
    "No response received from Public Authority",
  ]),
  reliefSought: z.string().min(15, "Please elaborate the relief/direction sought from Appellate Authority"),
});

export const responseDraftSchema = z.object({
  subject: z.string().min(5),
  responseText: z.string().min(10),
  pointWiseResponse: z.string().optional(),
  legalProvisions: z.string().optional(),
  missingInfoFlag: z.boolean().default(false),
  status: z.enum(["Draft", "Approved", "Sent"]),
});
