import { NextResponse } from "next/server";
import { loadInsightsData } from "@/lib/admin/load-insights-data";
import { buildDashboardInsights } from "@/lib/admin/insights";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rawData = await loadInsightsData();
    const insights = buildDashboardInsights(rawData);

    const responseData = {
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

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("DASHBOARD_API_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load dynamic dashboard data" },
      { status: 500 }
    );
  }
}
