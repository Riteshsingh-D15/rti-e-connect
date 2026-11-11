"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ShieldAlert, ArrowRight, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

function getHomePath(role) {
  if (role === "GOVERNMENT OFFICER") return "/officer/dashboard";
  if (role === "ADMINISTRATOR") return "/admin/dashboard";
  return "/citizen/dashboard";
}

function UnauthorizedContent() {
  const { data: session } = useSession();
  const params = useSearchParams();
  const requiredRole = params.get("required") || "AUTHORIZED ROLE";
  const fromPath = params.get("from") || "";

  const currentRole = session?.user?.role || "Guest";
  const homePath = getHomePath(session?.user?.role);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB] px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-200">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-rose-600">
          Server-Side Role Enforcement
        </p>
        <h1 className="mt-2 text-2xl font-black text-[#102A43]">
          Access Restricted for Current Role
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {fromPath ? (
            <>
              The workspace route <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-[#102A43]">{fromPath}</code> requires{" "}
            </>
          ) : (
            "This workspace requires "
          )}
          <strong className="text-[#102A43]">{requiredRole}</strong> privileges.
          You are currently signed in as{" "}
          <strong className="text-[#2563EB]">{currentRole}</strong>.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-xs text-slate-600">
          <div className="font-bold text-[#102A43]">Why am I seeing this?</div>
          <p className="mt-1 leading-5">
            Under RTI E Connect security policy, citizen personal records, PIO case
            files, and administrative controls are strictly separated by role.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {session?.user ? (
            <Link href={homePath}>
              <Button variant="navy" className="w-full sm:w-auto">
                Return to My Workspace <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="h-4 w-4" /> Home Page
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" /> Switch Account
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB] text-sm text-slate-500">
          Verifying access permissions...
        </div>
      }
    >
      <UnauthorizedContent />
    </Suspense>
  );
}
