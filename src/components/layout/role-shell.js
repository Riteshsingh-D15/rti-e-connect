"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";

export function RoleShell({ children, title, subtitle, userRole = "CITIZEN" }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#102A43]">
      <Sidebar
        role={userRole}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <main className="min-w-0 p-4 sm:p-6 lg:ml-64 lg:p-8">
        <div className="mx-auto w-full max-w-[1520px] space-y-6">
          <PageHeader
            title={title}
            subtitle={subtitle}
            userRole={userRole}
            onOpenMobileNav={() => setMobileOpen(true)}
          />
          <div className="space-y-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
