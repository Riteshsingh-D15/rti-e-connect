import Link from "next/link";
import { FilePlus } from "lucide-react";
import { ApplicationTable } from "@/components/applications/application-table";
import { RoleShell } from "@/components/layout/role-shell";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";
import { readStore } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function CitizenApplicationsPage() {
  const session = await getAuthSession();
  const store = await readStore();
  const allApps = store.applications || [];
  const isAdmin = session?.user?.role === "ADMINISTRATOR";
  const applications =
    isAdmin || !session?.user?.id
      ? allApps
      : allApps.filter((a) => a.citizenId === session.user.id);

  return (
    <RoleShell
      title="My RTI Applications"
      subtitle="Review all registered requests, monitor SLA deadlines, and download official responses."
      userRole="CITIZEN"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#102A43]">
            Filing History ({applications.length})
          </h2>
          <p className="text-xs text-slate-500">
            Click Track / View on any application to inspect milestones, reply to clarifications, or
            print your Section 6/7 certificate.
          </p>
        </div>
        <Link href="/citizen/submit">
          <Button>
            <FilePlus className="mr-2 h-4 w-4" /> Submit Another RTI
          </Button>
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <ApplicationTable rows={applications} isOfficer={false} />
      </section>
    </RoleShell>
  );
}
