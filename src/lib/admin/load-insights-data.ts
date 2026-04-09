import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";
import {InventoryLevel} from "@/lib/db/models/InventoryLevel";
import {Order} from "@/lib/db/models/Order";
import {Product} from "@/lib/db/models/Product";
import {User} from "@/lib/db/models/User";
import {Variant} from "@/lib/db/models/Variant";
import {Warehouse} from "@/lib/db/models/Warehouse";
import {toPlainObject} from "@/lib/utils/serialization";
import mongoose from "mongoose";

export async function loadInsightsData() {
  await dbConnect();
  const db = mongoose.connection.db!;

  const [
    ordersRaw,
    productsRaw,
    variantsRaw,
    brandsRaw,
    usersRaw,
    inventoryRaw,
    warehousesRaw,
    hardgoodsRaw,
    ogioRaw,
    softgoodsRaw,
    travisRaw,
  ] = await Promise.all([
    Order.find().sort({createdAt: -1}).lean(),
    Product.find().lean(),
    Variant.find().lean(),
    Brand.find().lean(),
    User.find({role: {$ne: "retailer"}}).lean(),
    InventoryLevel.find().lean(),
    Warehouse.find().lean(),
    db.collection("product_hardgoods").find().toArray(),
    db.collection("product_ogio").find().toArray(),
    db.collection("product_softgoods").find().toArray(),
    db.collection("product_travis").find().toArray(),
  ]);

  // Aggregating all products, ensuring we tag the brand-specific ones
  const aggregatedProducts = [
    ...(productsRaw || []).map((p) => ({...p, brandSource: "main"})),
    ...(hardgoodsRaw || []).map((p) => ({...p, brandSource: "hardgoods", brandName: "Hardgoods"})),
    ...(ogioRaw || []).map((p) => ({...p, brandSource: "ogio", brandName: "Ogio"})),
    ...(softgoodsRaw || []).map((p) => ({...p, brandSource: "softgoods", brandName: "Softgoods"})),
    ...(travisRaw || []).map((p) => ({...p, brandSource: "travis", brandName: "Travis Mathew"})),
  ];

  return {
    orders: toPlainObject(ordersRaw),
    products: toPlainObject(aggregatedProducts),
    variants: toPlainObject(variantsRaw),
    brands: toPlainObject(brandsRaw),
    users: toPlainObject(usersRaw),
    inventoryLevels: toPlainObject(inventoryRaw),
    warehouses: toPlainObject(warehousesRaw),
  };
}
