"use client"

import Link from "next/link";
import { DataTable } from "@/components/admin/DataTable";
import { SectionCard } from "@/components/admin/SectionCard";
import { deleteUserInternal } from "@/lib/actions/users";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { UserForm } from "@/components/accounts/UserForm";
import { removeUser } from "@/store/slices/users/userSlice";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

type LookupOption = {
  id: string;
  label: string;
  description?: string;

};

type AccountRecord = {
  id: string;
  name: string;
  email: string;
  roleId: string;

  roleName: string;
  designation: string;
  managerId: string;
  managerName: string;
  status: string;
  assignedBrandIds: string[];
  assignedWarehouseIds: string[];
  assignedBrandLabels: string[];
  assignedWarehouseLabels: string[];
};

export function AccountsWorkspace({
  title,
  description,
  // users, // Redux takes precedence for now
  roles,
  brands,
  warehouses,
  managers,
  // roleFilter,
  returnTo,
}: {
  title: string;
  description: string;
  users?: AccountRecord[];
  roles: LookupOption[];
  brands: LookupOption[];
  warehouses: LookupOption[];
  managers: LookupOption[];
  roleFilter?: string[];
  returnTo?: string;
}) {

  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const { allManager, allRetailer, allSaleRep } = useSelector((state: RootState) => state.user)


  const pathName = usePathname()
  const slug = pathName.split("/")[3]



  const filteredUsers = useMemo(() => {
    let baseUsers: any[] = [];
    if (slug === "all") baseUsers = [...allManager, ...allRetailer, ...allSaleRep];
    else if (slug === "managers") baseUsers = allManager;
    else if (slug === "retailers") baseUsers = allRetailer;
    else if (slug === "sales-representatives") baseUsers = allSaleRep;

    if (!searchQuery) return baseUsers;

    const query = searchQuery.toLowerCase();
    return baseUsers.filter((user) =>
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.code?.toString().toLowerCase().includes(query) ||
      user.designation?.toLowerCase().includes(query)
    );
  }, [slug, allManager, allRetailer, allSaleRep, searchQuery]);


  const handledeleteUser = async (user: any) => {
     const res = await deleteUserInternal(user._id);
     if(res.success){
      toast.success("User deleted successfully");
      dispatch(removeUser({ id: user._id, role: user.role }));
     }else{
      toast.error("Failed to delete user");
     }
    
  }
  // const defaultRoleId = availableRoles[0]?.id ?? "";

  return (
    <div className="space-y-4">
      <section className="premium-card overflow-hidden rounded-[28px]">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 px-4 py-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/42">
              Accounts
            </p>
            <h2 className="text-[1.85rem] font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="max-w-3xl text-sm text-foreground/62">{description}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/api/admin/export/users"
              className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-semibold text-foreground/76"
            >
              Export accounts
            </Link>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all ${showForm
                  ? "bg-danger/10 text-danger hover:bg-danger/15"
                  : "bg-primary text-white shadow-[0_12px_25px_rgba(15,132,255,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(15,132,255,0.4)]"
                }`}
            >
              {showForm ? (
                <>
                  <X size={18} />
                  Cancel
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add User
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid gap-4 px-4 py-4 md:grid-cols-3">
          <AccountSummary label="Visible accounts" value={String(allManager.length)} />
          <AccountSummary
            label="Active"
            value={String(allManager.filter((user) => user.status === "active").length)}
          />
        </div>
      </section>

      {showForm && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <UserForm
            roles={roles}
            brands={brands}
            warehouses={warehouses}
            managers={managers}
            returnTo={returnTo}
            title="Add New User"
            description="Complete the form below to create a new user account."
          />
        </div>
      )}

      <SectionCard
        title="Account list"
        action={
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by name, email, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 pr-10 text-sm outline-none transition-all focus:border-primary/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70"
              >
                <X size={16} />
              </button>
            )}
          </div>
        }
      >
        <DataTable headers={["Account", "Role", ...(slug === "managers" ? ["Manager"] : []), "Status", "Actions"]}>
          {filteredUsers.map((user) => {

            const manager = allManager.find((manager) => manager.manager_id === user.manager_id);
            console.log("manager--", manager)
            return (
              <tr key={user.id}>
                <td className="px-4 py-4">
                  <div className="font-semibold text-foreground">{user.name}</div>
                  <p className="text-xs text-foreground/55">{user.email}</p>
                </td>
                <td className="px-4 py-4 text-sm text-foreground/70">
                  <div className="font-medium text-foreground">{user.role}</div>
                  <p className="text-xs text-foreground/55">{user.designation || "No designation"}</p>
                </td>
                {slug === "managers" && (
                  <td className="px-4 py-4 text-sm text-foreground/70">{manager?.name || "None"}</td>
                )}
                <td className="px-4 py-4 text-sm text-foreground/70">{user.status}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">

                    <Link href={`/admin/users/${user._id}/edit`} className="text-sm font-semibold text-primary">Edit</Link>
                    {/* <form action={deleteUser}> */}
                      {/* <input type="hidden" name="id" value={user._id} /> */}
                      {/* <input type="hidden" name="redirectTo" value={returnTo ?? "/admin/accounts/all"} /> */}
                      <button className="text-sm font-semibold text-danger" onClick={() => handledeleteUser(user)}>Delete</button>
                    {/* </form> */}
                  </div>
                </td>``
              </tr>
            )
          })}
        </DataTable>
      </SectionCard>
    </div>
  );
}

function AccountSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="premium-card rounded-[22px] p-4 transition duration-200 hover:-translate-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
        {label}
      </p>
      <p className="mt-3 text-[2rem] font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}
