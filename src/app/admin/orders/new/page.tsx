import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";
import {NewOrderForm} from "@/components/admin/NewOrderForm";
import {saveOrder} from "@/lib/actions/orders";
import dbConnect from "@/lib/db/connection";
import {BlockedStock} from "@/lib/db/models/BlockedStock";
import {Brand} from "@/lib/db/models/Brand";
import {InventoryLevel} from "@/lib/db/models/InventoryLevel";
import {User} from "@/lib/db/models/User";
import {Variant} from "@/lib/db/models/Variant";
import {Warehouse} from "@/lib/db/models/Warehouse";
import {buildWarehouseAvailability, sumEffectiveAvailability} from "@/lib/utils/inventory";

export const dynamic = "force-dynamic";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  await dbConnect();
  const [users, brands, variants, warehouses] = await Promise.all([
    User.find({status: "active"}).sort({name: 1}).lean(),
    Brand.find({isActive: true}).sort({name: 1}).lean(),
    Variant.find({status: {$ne: "archived"}}).sort({updatedAt: -1}).limit(200).lean(),
    Warehouse.find({isActive: true}).sort({priority: 1}).lean(),
  ]);

  const [inventoryLevels, blockedStock] = await Promise.all([
    InventoryLevel.find({variantId: {$in: variants.map((variant) => variant._id)}}).lean(),
    BlockedStock.find({
      $or: [
        {variantId: {$in: variants.map((variant) => variant._id)}},
        {sku: {$in: variants.map((variant) => variant.sku)}},
      ],
    }).lean(),
  ]);

  const inventoryByVariant = new Map<string, typeof inventoryLevels>();
  for (const level of inventoryLevels) {
    const variantId = String(level.variantId);
    const existing = inventoryByVariant.get(variantId) ?? [];
    existing.push(level);
    inventoryByVariant.set(variantId, existing);
  }

  const blockedByVariant = new Map<string, typeof blockedStock>();
  for (const blocked of blockedStock) {
    const variantId =
      blocked.variantId?.toString() ??
      variants.find((variant) => variant.sku === blocked.sku)?._id.toString() ??
      "";

    if (!variantId) {
      continue;
    }

    const existing = blockedByVariant.get(variantId) ?? [];
    existing.push(blocked);
    blockedByVariant.set(variantId, existing);
  }

  const defaultRetailerId =
    typeof searchParams?.retailerId === "string" ? searchParams.retailerId : "";
  const defaultManagerId =
    typeof searchParams?.managerId === "string" ? searchParams.managerId : "";
  const defaultSalesRepId =
    typeof searchParams?.salesRepId === "string" ? searchParams.salesRepId : "";
  const defaultBrandId =
    typeof searchParams?.brandId === "string" ? searchParams.brandId : "";

  const selectedRetailer =
    users.find((user) => user._id.toString() === defaultRetailerId) ?? null;
  const retailerAssignedBrandId =
    selectedRetailer?.assignedBrandIds?.[0]?.toString() ?? "";

  return (
    <div className="space-y-8">
      <PageHeader title="Create order" description="Admin-first checkout foundation using existing variants, warehouse assignment, and discount modes." backHref="/admin/orders" />
      <SectionCard title="Order builder">
        <NewOrderForm
          action={saveOrder}
          retailers={users.filter((user) => user.role === "retailer").map((user) => ({id: user._id.toString(), label: user.name, sublabel: user.email}))}
          managers={users.filter((user) => user.role === "manager").map((user) => ({id: user._id.toString(), label: user.name}))}
          salesReps={users.filter((user) => user.role === "sales_rep").map((user) => ({id: user._id.toString(), label: user.name}))}
          brands={brands.map((brand) => ({id: brand._id.toString(), label: brand.name}))}
          defaults={{
            retailerId: defaultRetailerId,
            managerId: defaultManagerId || selectedRetailer?.managerId?.toString() || "",
            salesRepId: defaultSalesRepId,
            brandId: defaultBrandId || retailerAssignedBrandId,
          }}
          variants={variants.map((variant) => {
            const blockedRecords = blockedByVariant.get(variant._id.toString()) ?? [];
            const warehouseBlocked = new Map<string, number>();
            let globalBlocked = 0;

            for (const blocked of blockedRecords) {
              if (blocked.warehouseId) {
                const warehouseId = blocked.warehouseId.toString();
                warehouseBlocked.set(
                  warehouseId,
                  (warehouseBlocked.get(warehouseId) ?? 0) + Number(blocked.quantity ?? 0)
                );
              } else {
                globalBlocked += Number(blocked.quantity ?? 0);
              }
            }

            const levels = buildWarehouseAvailability(
              warehouses.map((warehouse) => {
                const level =
                  inventoryByVariant
                    .get(variant._id.toString())
                    ?.find(
                      (entry) =>
                        entry.warehouseId.toString() === warehouse._id.toString()
                    ) ?? null;

                return {
                  warehouseId: warehouse._id.toString(),
                  code: warehouse.code,
                  priority: warehouse.priority ?? 999,
                  onHand: Number(level?.onHand ?? 0),
                  reserved: Number(level?.reserved ?? 0),
                  blocked: Number(level?.blocked ?? 0),
                  warehouseBlocked: Number(
                    warehouseBlocked.get(warehouse._id.toString()) ?? 0
                  ),
                };
              }),
              globalBlocked
            );

            const available = sumEffectiveAvailability(levels);
            return {
              id: variant._id.toString(),
              label: `${variant.sku} · ${variant.title} · ${available} available`,
            };
          })}
          warehouses={warehouses.map((warehouse) => ({id: warehouse._id.toString(), label: `${warehouse.code} · ${warehouse.name}`}))}
        />
      </SectionCard>
    </div>
  );
}
