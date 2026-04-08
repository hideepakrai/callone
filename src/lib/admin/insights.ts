type InsightOrder = {
  createdAt: string | Date;
  workflowStatus: string;
  pricing?: {
    finalTotal?: number;
  };
  participantSnapshots?: {
    manager?: {name?: string};
    salesRep?: {name?: string};
    retailer?: {name?: string};
  };
  items?: Array<{
    sku?: string;
    name?: string;
    brandName?: string;
    quantity?: number;
    finalAmount?: number;
  }>;
};

type InsightProduct = {
  _id: string;
  brandId?: string;
  status?: string;
};

type InsightVariant = {
  _id: string;
  productId?: string;
};

type InsightBrand = {
  _id: string;
  name: string;
  code?: string;
};

type InsightUser = {
  roleKey?: string;
  name?: string;
};

type InsightInventoryLevel = {
  variantId?: string;
  available?: number;
};

export type TrendPoint = {
  label: string;
  value: number;
  count?: number;
};

export type BreakdownItem = {
  label: string;
  value: number;
  tone?: "emerald" | "amber" | "rose" | "blue" | "slate";
  helper?: string;
};

export type LeaderboardItem = {
  label: string;
  sublabel: string;
  value: number;
  secondary?: number;
};

export type BrandCatalogInsight = {
  label: string;
  products: number;
  variants: number;
  stock: number;
};

export type DashboardInsights = {
  headline: {
    totalOrders: number;
    totalRevenue: number;
    activeProducts: number;
    availableUnits: number;
    pendingApprovals: number;
    averageOrderValue: number;
  };
  weeklyOrderValue: TrendPoint[];
  workflowBreakdown: BreakdownItem[];
  topProducts: LeaderboardItem[];
  topContributors: LeaderboardItem[];
  roleDistribution: BreakdownItem[];
  brandCatalog: BrandCatalogInsight[];
  warehouseBreakdown: BreakdownItem[];
};

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatWeekLabel(date: Date) {
  return date.toLocaleDateString("en-IN", {month: "short", day: "numeric"});
}

function toneForStatus(status: string): BreakdownItem["tone"] {
  switch (status.toLowerCase()) {
    case "completed":
      return "emerald";
    case "manager_approval":
    case "availability_check":
    case "pending":
      return "amber";
    case "rejected":
    case "cancelled":
      return "rose";
    case "approved":
    case "submitted":
      return "blue";
    default:
      return "slate";
  }
}

function cleanOrders(orders: InsightOrder[]) {
  return orders.filter((order) => {
    const status = (order.workflowStatus || (order as any).status || "").toLowerCase();
    return status !== "cancelled" && status !== "rejected";
  });
}

function getOrderAmount(order: InsightOrder): number {
  return Number(order.pricing?.finalTotal ?? (order as any).totalAmount ?? 0);
}

type InsightWarehouse = {
  _id: string;
  name: string;
  code: string;
};

export function buildDashboardInsights({
  orders,
  products,
  variants,
  brands,
  users,
  inventoryLevels,
  warehouses,
}: {
  orders: InsightOrder[];
  products: InsightProduct[];
  variants: InsightVariant[];
  brands: InsightBrand[];
  users: InsightUser[];
  inventoryLevels: InsightInventoryLevel[];
  warehouses: InsightWarehouse[];
}): DashboardInsights {
  const relevantOrders = cleanOrders(orders);
  const totalRevenue = relevantOrders.reduce(
    (sum, order) => sum + getOrderAmount(order),
    0
  );
  
  const pendingApprovalsCount = relevantOrders.filter((order) => {
    const status = (order.workflowStatus || (order as any).status || "").toLowerCase();
    return ["submitted", "availability_check", "manager_approval", "pending"].includes(status);
  }).length;

  // Relevant products: strictly status 'active' for 'Active Products' headline
  const activeProducts = products.filter((product) => product.status === "active").length;
  
  const availableUnits = inventoryLevels.reduce(
    (sum, inventory) => sum + Number(inventory.available ?? 0),
    0
  );

  const weeklyOrderValue: TrendPoint[] = Array.from({length: 8}, (_, index) => {
    const weekStart = startOfWeek(new Date());
    weekStart.setDate(weekStart.getDate() - (7 - index) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const ordersInWeek = relevantOrders.filter((order) => {
      const createdAt = new Date(order.createdAt);
      return createdAt >= weekStart && createdAt < weekEnd;
    });

    return {
      label: formatWeekLabel(weekStart),
      value: ordersInWeek.reduce(
        (sum, order) => sum + getOrderAmount(order),
        0
      ),
      count: ordersInWeek.length,
    };
  });

  const workflowMap = relevantOrders.reduce((map, order) => {
    const status = order.workflowStatus || (order as any).status || "pending";
    const key = status.toLowerCase();
    map.set(key, (map.get(key) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  const workflowBreakdown = Array.from(workflowMap.entries())
    .map(([label, value]) => ({
      label: label.replace(/_/g, " "),
      value,
      tone: toneForStatus(label),
    }))
    .sort((left, right) => right.value - left.value);

  const productMap = relevantOrders.reduce((map, order) => {
    for (const item of order.items ?? []) {
      const key = item.sku || item.name || "Unknown item";
      const entry =
        map.get(key) ?? {
          label: item.name || item.sku || "Unknown item",
          sublabel: item.brandName || "Brand not tagged",
          value: 0,
          secondary: 0,
        };
      entry.value += Number(item.quantity ?? 0);
      entry.secondary = (entry.secondary ?? 0) + Number(item.finalAmount ?? 0);
      map.set(key, entry);
    }
    return map;
  }, new Map<string, LeaderboardItem>());

  const topProducts = Array.from(productMap.values())
    .sort((left, right) => right.value - left.value || (right.secondary ?? 0) - (left.secondary ?? 0))
    .slice(0, 6);

  const contributorMap = relevantOrders.reduce((map, order) => {
    const salesRep = order.participantSnapshots?.salesRep?.name?.trim();
    const manager = order.participantSnapshots?.manager?.name?.trim();
    const participants = [
      salesRep ? {name: salesRep, role: "Sales"} : null,
      manager ? {name: manager, role: "Manager"} : null,
    ].filter(Boolean) as Array<{name: string; role: string}>;

    for (const participant of participants) {
      const entry =
        map.get(`${participant.role}:${participant.name}`) ?? {
          label: participant.name,
          sublabel: participant.role,
          value: 0,
          secondary: 0,
        };
      entry.value += 1;
      entry.secondary = (entry.secondary ?? 0) + getOrderAmount(order);
      map.set(`${participant.role}:${participant.name}`, entry);
    }

    return map;
  }, new Map<string, LeaderboardItem>());

  const topContributors = Array.from(contributorMap.values())
    .sort((left, right) => (right.secondary ?? 0) - (left.secondary ?? 0))
    .slice(0, 6);

  const roleDistribution = Array.from(
    users.reduce((map, user) => {
      const label = (user.roleKey || "unassigned").replace(/_/g, " ");
      map.set(label, (map.get(label) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
      .entries()
  )
    .map(([label, value]) => ({
      label,
      value,
      tone: (
        label.includes("manager")
          ? "amber"
          : label.includes("sales")
            ? "blue"
            : label.includes("admin")
              ? "emerald"
              : "slate"
      ) as BreakdownItem["tone"],
    }))
    .sort((left, right) => right.value - left.value);

  // Robust Brand Mapping
  const brandLookup = brands.reduce((map, brand) => {
    map.set(String(brand._id), brand.name);
    return map;
  }, new Map<string, string>());

  const inventoryByVariantId = inventoryLevels.reduce((map, inventory) => {
    const key = String(inventory.variantId ?? "");
    map.set(key, (map.get(key) ?? 0) + Number(inventory.available ?? 0));
    return map;
  }, new Map<string, number>());

  const variantsByProductId = variants.reduce((map, variant) => {
    const key = String(variant.productId ?? "");
    map.set(key, (map.get(key) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  const stockByProductId = variants.reduce((map, variant) => {
    const productId = String(variant.productId ?? "");
    const variantId = String(variant._id ?? "");
    map.set(productId, (map.get(productId) ?? 0) + (inventoryByVariantId.get(variantId) ?? 0));
    return map;
  }, new Map<string, number>());

  const brandCatalog = Array.from(
    products.reduce((map, product) => {
      const brandId = String(product.brandId ?? "");
      const brandLabel = brandLookup.get(brandId) || (product as any).brandName || "Unassigned";
      const entry =
        map.get(brandLabel) ?? {label: brandLabel, products: 0, variants: 0, stock: 0};
      entry.products += 1;
      entry.variants += variantsByProductId.get(String(product._id)) ?? 0;
      entry.stock += stockByProductId.get(String(product._id)) ?? 0;
      map.set(brandLabel, entry);
      return map;
    }, new Map<string, BrandCatalogInsight>())
      .values()
  )
    .sort((left, right) => right.products - left.products)
    .slice(0, 6);

  // New: Warehouse Distribution
  const warehouseLookup = warehouses.reduce((map, wh) => {
    map.set(wh._id.toString(), wh.name || wh.code);
    return map;
  }, new Map<string, string>());

  const warehouseMap = inventoryLevels.reduce((map, inventory) => {
    const whId = String((inventory as any).warehouseId || "unknown");
    map.set(whId, (map.get(whId) ?? 0) + Number(inventory.available ?? 0));
    return map;
  }, new Map<string, number>());

  const warehouseBreakdown = Array.from(warehouseMap.entries())
    .map(([id, value]) => ({
      label: warehouseLookup.get(id) || "Unknown Warehouse",
      value,
      tone: "blue" as const,
    }))
    .sort((left, right) => right.value - left.value);

  return {
    headline: {
      totalOrders: relevantOrders.length,
      totalRevenue,
      activeProducts,
      availableUnits,
      pendingApprovals: pendingApprovalsCount,
      averageOrderValue: relevantOrders.length ? totalRevenue / relevantOrders.length : 0,
    },
    weeklyOrderValue,
    workflowBreakdown,
    topProducts,
    topContributors,
    roleDistribution,
    brandCatalog,
    warehouseBreakdown,
  };
}
