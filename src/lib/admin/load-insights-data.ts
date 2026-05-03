import mongoose from "mongoose";
import dbConnect from "@/lib/db/connection";
import { Brand } from "@/lib/db/models/Brand";
import { InventoryLevel } from "@/lib/db/models/InventoryLevel";
import { Order } from "@/lib/db/models/Order";
import { Product } from "@/lib/db/models/Product";
import { User } from "@/lib/db/models/User";
import { Variant } from "@/lib/db/models/Variant";
import { Warehouse } from "@/lib/db/models/Warehouse";
import { toPlainObject } from "@/lib/utils/serialization";

export type DashboardLoadStepKey =
  | "orders"
  | "products"
  | "variants"
  | "brands"
  | "users"
  | "inventory_levels"
  | "warehouses"
  | "product_hardgoods"
  | "product_ogio"
  | "product_softgoods"
  | "product_travis";

export type DashboardLoadStepStatus = "loading" | "ready" | "error";

export type DashboardLoadProgress = {
  key: DashboardLoadStepKey;
  label: string;
  status: DashboardLoadStepStatus;
  count?: number;
  durationMs?: number;
  message?: string;
};

type LoadInsightsOptions = {
  onProgress?: (progress: DashboardLoadProgress) => void | Promise<void>;
};

const DASHBOARD_LOAD_STEP_LABELS: Record<DashboardLoadStepKey, string> = {
  orders: "orders",
  products: "products",
  variants: "variants",
  brands: "brands",
  users: "users",
  inventory_levels: "inventory_levels",
  warehouses: "warehouses",
  product_hardgoods: "product_hardgoods",
  product_ogio: "product_ogio",
  product_softgoods: "product_softgoods",
  product_travis: "product_travis",
};

async function emitProgress(
  onProgress: LoadInsightsOptions["onProgress"],
  progress: DashboardLoadProgress
) {
  if (onProgress) {
    await onProgress(progress);
  }
}

function collectionCount(value: unknown) {
  return Array.isArray(value) ? value.length : undefined;
}

async function loadTrackedStep<T>(
  key: DashboardLoadStepKey,
  loader: () => Promise<T>,
  onProgress?: LoadInsightsOptions["onProgress"]
) {
  const label = DASHBOARD_LOAD_STEP_LABELS[key];
  const startedAt = Date.now();

  await emitProgress(onProgress, {
    key,
    label,
    status: "loading",
    message: `Loading ${label}...`,
  });

  try {
    const result = await loader();

    await emitProgress(onProgress, {
      key,
      label,
      status: "ready",
      count: collectionCount(result),
      durationMs: Date.now() - startedAt,
      message: `${label} ready`,
    });

    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown loader failure";

    await emitProgress(onProgress, {
      key,
      label,
      status: "error",
      durationMs: Date.now() - startedAt,
      message,
    });

    throw error;
  }
}

async function loadRawCollection(db: mongoose.mongo.Db | undefined, name: string) {
  if (!db) {
    return [];
  }

  try {
    return await db.collection(name).find().toArray();
  } catch {
    return [];
  }
}

export async function loadInsightsData({ onProgress }: LoadInsightsOptions = {}) {
  await dbConnect();
  const db = mongoose.connection.db;

  if (!db) {
    console.warn("LOAD_INSIGHTS_WARN: MongoDB connection.db is not available.");
  }

  const useTrackedLoading = Boolean(onProgress);

  const loadOrders = () => Order.find().sort({ createdAt: -1 }).lean();
  const loadProducts = () => Product.find().lean();
  const loadVariants = () => Variant.find().lean();
  const loadBrands = () => Brand.find().lean();
  const loadUsers = () => User.find({ role: { $ne: "retailer" } }).lean();
  const loadInventory = () => InventoryLevel.find().lean();
  const loadWarehouses = () => Warehouse.find().lean();
  const loadHardgoods = () => loadRawCollection(db, "product_hardgoods");
  const loadOgio = () => loadRawCollection(db, "product_ogio");
  const loadSoftgoods = () => loadRawCollection(db, "product_softgoods");
  const loadTravis = () => loadRawCollection(db, "product_travis");

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
  ] = useTrackedLoading
    ? await (async () => {
        const orders = await loadTrackedStep("orders", loadOrders, onProgress);
        const products = await loadTrackedStep("products", loadProducts, onProgress);
        const variants = await loadTrackedStep("variants", loadVariants, onProgress);
        const brands = await loadTrackedStep("brands", loadBrands, onProgress);
        const users = await loadTrackedStep("users", loadUsers, onProgress);
        const inventory = await loadTrackedStep(
          "inventory_levels",
          loadInventory,
          onProgress
        );
        const warehouses = await loadTrackedStep(
          "warehouses",
          loadWarehouses,
          onProgress
        );
        const hardgoods = await loadTrackedStep(
          "product_hardgoods",
          loadHardgoods,
          onProgress
        );
        const ogio = await loadTrackedStep("product_ogio", loadOgio, onProgress);
        const softgoods = await loadTrackedStep(
          "product_softgoods",
          loadSoftgoods,
          onProgress
        );
        const travis = await loadTrackedStep(
          "product_travis",
          loadTravis,
          onProgress
        );

        return [
          orders,
          products,
          variants,
          brands,
          users,
          inventory,
          warehouses,
          hardgoods,
          ogio,
          softgoods,
          travis,
        ] as const;
      })()
    : await Promise.all([
        loadOrders(),
        loadProducts(),
        loadVariants(),
        loadBrands(),
        loadUsers(),
        loadInventory(),
        loadWarehouses(),
        loadHardgoods(),
        loadOgio(),
        loadSoftgoods(),
        loadTravis(),
      ]);

  const aggregatedProducts = [
    ...(productsRaw || []).map((product) => ({ ...product, brandSource: "main" })),
    ...(hardgoodsRaw || []).map((product) => ({
      ...product,
      brandSource: "hardgoods",
      brandName: "Hardgoods",
    })),
    ...(ogioRaw || []).map((product) => ({
      ...product,
      brandSource: "ogio",
      brandName: "Ogio",
    })),
    ...(softgoodsRaw || []).map((product) => ({
      ...product,
      brandSource: "softgoods",
      brandName: "Softgoods",
    })),
    ...(travisRaw || []).map((product) => ({
      ...product,
      brandSource: "travis",
      brandName: "Travis Mathew",
    })),
  ];

  return {
    orders: toPlainObject(ordersRaw || []),
    products: toPlainObject(aggregatedProducts),
    variants: toPlainObject(variantsRaw || []),
    brands: toPlainObject(brandsRaw || []),
    users: toPlainObject(usersRaw || []),
    inventoryLevels: toPlainObject(inventoryRaw || []),
    warehouses: toPlainObject(warehousesRaw || []),
  };
}
