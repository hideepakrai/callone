import Link from "next/link";
import {notFound} from "next/navigation";
import {AccountsWorkspace} from "@/components/accounts/AccountsWorkspace";
import {getAccountSection} from "@/lib/admin/account-sections";
import {loadAccountRecords} from "@/lib/admin/load-account-records";

export const dynamic = "force-dynamic";

export default async function AccountSectionPage({
  params,
}: {
  params: {section: string};
}) {
  const section = getAccountSection(params.section);
  if (!section) {
    notFound();
  }
  
  const {users, roles, brands, warehouses, managers} = await loadAccountRecords();
  const filteredUsers =
    section.slug === "all"
      ? users
      : users.filter((user) => section.roles.includes(user.role));

  return (
    <div className="space-y-4">
      <AccountsWorkspace
        title={section.label}
        description={section.description}
         users={filteredUsers as any}
        roles={roles}
        brands={brands}
        warehouses={warehouses}
        managers={managers}
        roleFilter={section.slug === "all" ? undefined : section.roles}
        returnTo={`/admin/accounts/${section.slug}`}
      />

      <section className="premium-card rounded-[28px] px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/42">
              Permissions
            </p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">
              Roles and access bundles
            </h3>
            <p className="mt-1 text-sm text-foreground/62">
              Maintain permission sets separately from account assignments when access rules change.
            </p>
          </div>
          <Link
            href="/admin/roles"
            className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-semibold text-foreground/78"
          >
            Open roles
          </Link>
        </div>
      </section>
    </div>
  );
}
