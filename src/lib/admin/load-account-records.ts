import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";
import {Role} from "@/lib/db/models/Role";
import {User} from "@/lib/db/models/User";
import {Warehouse} from "@/lib/db/models/Warehouse";
import {toPlainObject} from "@/lib/utils/serialization";

type LookupOption = {
  id: string;
  label: string;
  description?: string;
  role?: string;
};

export async function loadAccountRecords() {
  await dbConnect();

  const [usersRaw, rolesRaw, brandsRaw, warehousesRaw, managersRaw] = await Promise.all([
    User.find().sort({name: 1}).lean(),
    Role.find({isActive: true}).sort({name: 1}).lean(),
    Brand.find({isActive: true}).sort({name: 1}).lean(),
    Warehouse.find({isActive: true}).sort({priority: 1, name: 1}).lean(),
    User.find({role: {$in: ["super_admin", "admin", "manager"]}})
      .sort({name: 1})
      .lean(),
  ]);

  const users = toPlainObject(usersRaw);
  const roles = toPlainObject(rolesRaw);
  const brands = toPlainObject(brandsRaw);
  const warehouses = toPlainObject(warehousesRaw);
  const managers = toPlainObject(managersRaw);

  const roleMap = new Map(
    roles.map((role) => [
      String(role._id ?? ""),
      {
        id: String(role._id ?? ""),
        label: role.name,
        description: role.description,
        role: role.key,
      },
    ])
  );

  const brandMap = new Map(
    brands.map((brand) => [
      String(brand._id ?? ""),
      {
        id: String(brand._id ?? ""),
        label: brand.name,
        description: brand.code,
      },
    ])
  );

  const warehouseMap = new Map(
    warehouses.map((warehouse) => [
      String(warehouse._id ?? ""),
      {
        id: String(warehouse._id ?? ""),
        label: warehouse.name,
        description: warehouse.code,
      },
    ])
  );

  const managerMap = new Map(
    managers.map((manager) => [
      String(manager._id ?? ""),
      {
        id: String(manager._id ?? ""),
        label: manager.name,
        description: manager.email,
      },
    ])
  );

  const accountRecords = users.map((user) => {
    const role = roleMap.get(String(user.roleId ?? ""));
    const assignedBrandIds = ((user.assignedBrandIds ?? []) as unknown[]).map((value) => String(value));
    const assignedWarehouseIds = ((user.assignedWarehouseIds ?? []) as unknown[]).map((value) =>
      String(value)
    );

    return {
      id: String(user._id ?? ""),
      name: user.name ?? "",
      email: user.email ?? "",
      roleId: String(user.roleId ?? ""),
      role: user.role ?? "",
      roleName: role?.label ?? user.role ?? "Unassigned",
      designation: user.designation ?? "",
      managerId: String(user.managerId ?? ""),
      managerName: managerMap.get(String(user.managerId ?? ""))?.label ?? "",
      status: user.status ?? "active",
      assignedBrandIds,
      assignedWarehouseIds,
      assignedBrandLabels: assignedBrandIds
        .map((id) => brandMap.get(id)?.label)
        .filter(Boolean) as string[],
      assignedWarehouseLabels: assignedWarehouseIds
        .map((id) => warehouseMap.get(id)?.label)
        .filter(Boolean) as string[],
    };
  });

  return {
    users: accountRecords,
    roles: Array.from(roleMap.values()) as LookupOption[],
    brands: Array.from(brandMap.values()) as LookupOption[],
    warehouses: Array.from(warehouseMap.values()) as LookupOption[],
    managers: Array.from(managerMap.values()) as LookupOption[],
  };
}
