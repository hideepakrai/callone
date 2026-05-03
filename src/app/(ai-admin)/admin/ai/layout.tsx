import { cookies } from "next/headers";
import { requireAdminSession } from "@/lib/auth/session";
import { resolveViewRole } from "@/lib/auth/view-role";
import { AiAdminShell } from "@/components/admin/ai/AiAdminShell";
import { isAiAdminEnabled } from "@/lib/admin/feature-flags";

export const dynamic = "force-dynamic";

export default async function AiAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAiAdminEnabled()) {
    const { redirect } = await import("next/navigation");
    redirect("/admin");
  }

  const session = await requireAdminSession();
  const viewRole = resolveViewRole(
    session.user.role,
    cookies().get("callone-view-role")?.value
  );

  return (
    <AiAdminShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        viewRole,
      }}
    >
      {children}
    </AiAdminShell>
  );
}
