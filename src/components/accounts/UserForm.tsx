"use client";

import { UserInterface } from "@/store/slices/users/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { createUser, updateUser } from "@/store/slices/users/userThunks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type LookupOption = {
  id: string;
  label: string;
  description?: string;
};

type UserFormProps = {
  user?: UserInterface;
  roles: LookupOption[];
  brands: LookupOption[];
  warehouses: LookupOption[];
  managers: LookupOption[];
  returnTo?: string;
  title?: string;
  description?: string;
};

export function UserForm({
  user,
  roles,
  brands,
  warehouses,
  managers,
  returnTo,
  title = user ? "Edit Account" : "Create Account",
  description = user ? "Update account details and permissions." : "Add a new account directly into the selected role group.",
}: UserFormProps) {
  const isEdit = !!user;
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {allManager}= useSelector((state:RootState)=>state.user)

  const managerOptions = allManager.map((manager) => ({
    id: (manager._id || manager.id) as string,
    label: manager.name,
  }));

  const handleSave = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const data: any = {};
        formData.forEach((value, key) => {
          data[key] = value;
        });

        // Special handling for these fields in actions but thunks might need them as plain objects
        // data.assignedBrandIds = formData.getAll("assignedBrandIds").map(String).filter(Boolean);
        // data.assignedWarehouseIds = formData.getAll("assignedWarehouseIds").map(String).filter(Boolean);

        let resultAction;
        if (isEdit) {
          resultAction = await dispatch(updateUser(data));
        } else {
          resultAction = await dispatch(createUser(data));
        }

        if (createUser.fulfilled.match(resultAction) || updateUser.fulfilled.match(resultAction)) {
          toast.success(isEdit ? "User updated successfully" : "User created successfully");
          router.back();
        } else if (createUser.rejected.match(resultAction) || updateUser.rejected.match(resultAction)) {
          const errorMessage = (resultAction.payload as string) || "Failed to save user";
          toast.error(errorMessage);
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };
  return (
    <div className="premium-card overflow-hidden rounded-[28px]">
      <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-foreground/58">{description}</p>
        </div>
      </div>
      <div className="p-5">
        <form action={handleSave} className="grid gap-6 lg:grid-cols-2">
          {isEdit && <input type="hidden" name="id" value={user._id || (user.id as string)} />}
          <input type="hidden" name="redirectTo" value={returnTo ?? "/admin/accounts/all"} />
          <input type="hidden" name="status" value={user?.status || "active"} />

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Name</span>
            <input
              name="name"
              defaultValue={user?.name}
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary/50"
              placeholder="Full Name"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Email</span>
            <input
              name="email"
              type="email"
              defaultValue={user?.email}
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary/50"
              placeholder="email@example.com"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Password</span>
            <input
              name="password"
              type="password"
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary/50"
              placeholder={isEdit ? "Leave blank to keep current" : "Minimum 8 characters"}
              required={!isEdit}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Role</span>
            <select
              name="roleId"
              defaultValue={(user as any)?.roleId || ""}
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary/50"
              required
            >
              <option value="" disabled>Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Designation</span>
            <input
              name="designation"
              defaultValue={user?.designation}
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary/50"
              placeholder="e.g. Regional Manager"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Manager</span>
            <select
              name="manager_id"
              defaultValue={user?.manager_id || (user as any)?.managerId || ""}
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary/50"
            >
              <option value="">No manager</option>
              {managerOptions.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Phone</span>
            <input
              name="phone"
              defaultValue={user?.phone?.toString()}
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary/50"
              placeholder="+91 XXXXXXXXXX"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Phone 2</span>
            <input
              name="phone2"
              defaultValue={(user as any)?.phone2?.toString()}
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary/50"
              placeholder="+91 XXXXXXXXXX"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Code (Legacy ID)</span>
            <input
              name="code"
              defaultValue={user?.code?.toString() || user?.id?.toString()}
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary/50"
              placeholder="e.g. 101"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">GSTIN</span>
            <input
              name="gstin"
              defaultValue={user?.gstin}
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary/50"
              placeholder="GGSTT12345"
            />
          </label>

          <label className="block">
             <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Status</span>
             <select
               name="status"
               defaultValue={user?.status || "active"}
               className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none"
             >
               <option value="active">Active</option>
               <option value="inactive">Inactive</option>
             </select>
           </label>

          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Address</span>
            <textarea
              name="address"
              rows={3}
              defaultValue={user?.address}
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary/50"
              placeholder="Full address details"
            />
          </label>
{/* 
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Assigned brands</span>
            <select
              name="assignedBrandIds"
              multiple
              size={5}
              defaultValue={(user as any)?.assignedBrandIds || []}
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none"
            >
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[10px] text-foreground/40 italic">Hold Ctrl/Cmd to select multiple</p>
          </label> */}

          {/* <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Assigned warehouses</span>
            <select
              name="assignedWarehouseIds"
              multiple
              size={5}
              defaultValue={(user as any)?.assignedWarehouseIds || []}
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none"
            >
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[10px] text-foreground/40 italic">Hold Ctrl/Cmd to select multiple</p>
          </label> */}

          <div className="flex justify-end lg:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(15,132,255,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(15,132,255,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Saving..." : isEdit ? "Update Account" : "Save Account"}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(15,132,255,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(15,132,255,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
