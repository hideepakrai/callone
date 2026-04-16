import Link from "next/link";
import {DataTable} from "@/components/admin/DataTable";
import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";
import {deleteWarehouse, saveWarehouse} from "@/lib/actions/warehouses";
import dbConnect from "@/lib/db/connection";
import {InventoryLevel} from "@/lib/db/models/InventoryLevel";
import {Warehouse} from "@/lib/db/models/Warehouse";
import WareHouseForm from "@/components/warehouse/WareHouseForm";
import WareHouseHome from "@/components/warehouse/WareHouseHome";

export const dynamic = "force-dynamic";

export default async function WarehousesPage() {
  await dbConnect();
  const [warehouses, inventoryLevels] = await Promise.all([
    Warehouse.find().sort({priority: 1, code: 1}).lean(),
    InventoryLevel.find().lean(),
  ]);

  const inventorySummary = new Map<
    string,
    {skuCount: number; onHand: number; reserved: number; available: number}
  >();

  for (const level of inventoryLevels) {
    const warehouseId = level.warehouseId.toString();
    const current = inventorySummary.get(warehouseId) ?? {
      skuCount: 0,
      onHand: 0,
      reserved: 0,
      available: 0,
    };

    inventorySummary.set(warehouseId, {
      skuCount: current.skuCount + 1,
      onHand: current.onHand + Number(level.onHand ?? 0),
      reserved: current.reserved + Number(level.reserved ?? 0),
      available: current.available + Number(level.available ?? 0),
    });
  }

  return (
    <div className="space-y-8">
  
    <WareHouseHome
    warehouses={warehouses}
    inventorySummary={inventorySummary}
    />
      
    </div>
  );
}
