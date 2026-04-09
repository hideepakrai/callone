import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import dbConnect from "@/lib/db/connection";
import { Brand } from "@/lib/db/models/Brand";
import { Role } from "@/lib/db/models/Role";
import { User } from "@/lib/db/models/User";
import { Warehouse } from "@/lib/db/models/Warehouse";

import { isValidObjectId } from "mongoose";
import { UserForm } from "@/components/accounts/UserForm";
export default async function EditUserPage({ params }: { params: { id: string } }) {
  await dbConnect();

  const query = isValidObjectId(params.id)
    ? { _id: params.id }
    : { id: Number(params.id) };

  const [user, roles, brands, warehouses, managers] = await Promise.all([
    User.findOne(query).lean(),
    Role.find({ isActive: true }).sort({ name: 1 }).lean(),
    Brand.find({ isActive: true }).sort({ name: 1 }).lean(),
    Warehouse.find({ isActive: true }).sort({ priority: 1 }).lean(),
    User.find({ role: { $in: ["super_admin", "admin", "manager"] } }).sort({ name: 1 }).lean(),
  ]);

  if (!user) {
    notFound();
  }

  // Transform data for UserForm
  const transformedUser = JSON.parse(JSON.stringify(user));
  const mappedRoles = roles.map(r => ({ id: String(r._id), label: r.name }));
  const mappedBrands = brands.map(b => ({ id: String(b._id), label: b.name }));
  const mappedWarehouses = warehouses.map(w => ({ id: String(w._id), label: w.name }));
  const mappedManagers = managers.map(m => ({ id: String(m._id), label: m.name }));

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Edit ${user.name}`}
        description="Update account details and permissions."
        backHref="/admin/accounts/all"
      />
      <UserForm
        user={transformedUser}
        roles={mappedRoles}
        brands={mappedBrands}
        warehouses={mappedWarehouses}
        managers={mappedManagers}
        returnTo="/admin/accounts/all"
      />
    </div>
  );
}
