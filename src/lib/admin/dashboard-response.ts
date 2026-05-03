import { buildDashboardInsights } from "@/lib/admin/insights";

export function buildDashboardResponse(rawData: Parameters<typeof buildDashboardInsights>[0]) {
  const insights = buildDashboardInsights(rawData);

  return {
    brandCoverage: insights.brandCatalog.map((item) => ({
      brand: item.label,
      items: item.products,
      skus: item.variants,
      stock: item.stock,
    })),
    topProducts: insights.topProducts.map((item) => ({
      sku: item.label,
      brand: item.sublabel === "Brand not tagged" ? "" : item.sublabel,
      orders: item.value,
      value: item.secondary || 0,
    })),
    headline: insights.headline,
    weeklyOrderValue: insights.weeklyOrderValue,
    workflowBreakdown: insights.workflowBreakdown,
    warehouseBreakdown: insights.warehouseBreakdown,
    roleDistribution: insights.roleDistribution,
    topContributors: insights.topContributors,
  };
}
