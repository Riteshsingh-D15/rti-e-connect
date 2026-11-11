import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid official or citizen email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CITIZEN", "GOVERNMENT OFFICER", "ADMINISTRATOR"]).default("CITIZEN"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number").optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  district: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});
