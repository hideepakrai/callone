import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";
import {InventoryLevel} from "@/lib/db/models/InventoryLevel";
import {Order} from "@/lib/db/models/Order";
import {Product} from "@/lib/db/models/Product";
import {User} from "@/lib/db/models/User";
import {Variant} from "@/lib/db/models/Variant";
import {Warehouse} from "@/lib/db/models/Warehouse";
import {toPlainObject} from "@/lib/utils/serialization";

export async function loadInsightsData() {
  await dbConnect();

  const [ordersRaw, productsRaw, variantsRaw, brandsRaw, usersRaw, inventoryRaw, warehousesRaw] =
    await Promise.all([
      Order.find().sort({createdAt: -1}).lean(),
      Product.find().lean(),
      Variant.find().lean(),
      Brand.find().lean(),
      User.find({roleKey: {$ne: "retailer"}}).lean(),
      InventoryLevel.find().lean(),
      Warehouse.find().lean(),
    ]);

  return {
    orders: toPlainObject(ordersRaw),
    products: toPlainObject(productsRaw),
    variants: toPlainObject(variantsRaw),
    brands: toPlainObject(brandsRaw),
    users: toPlainObject(usersRaw),
    inventoryLevels: toPlainObject(inventoryRaw),
    warehouses: toPlainObject(warehousesRaw),
  };
}
