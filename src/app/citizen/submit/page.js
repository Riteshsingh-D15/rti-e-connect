import { RoleShell } from "@/components/layout/role-shell";
import RTISubmissionForm from "@/components/forms/rti-submission-form";

export const dynamic = "force-dynamic";

export default async function CitizenSubmitPage({ searchParams }) {
  const resolved = await searchParams;
  const initialTemplateSlug =
    typeof resolved?.template === "string" ? resolved.template : "";

  return (
    <RoleShell
      title="Submit New RTI Application"
      subtitle="File a statutory Section 6(1) Right to Information request with AI quality assistance"
      userRole="CITIZEN"
    >
      <RTISubmissionForm initialTemplateSlug={initialTemplateSlug} />
    </RoleShell>
  );
}
