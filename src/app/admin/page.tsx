"use client";

import React, { useEffect, useState } from "react";
import {
  BrandCatalogCard,
  BreakdownCard,
  InsightMetricCard,
  LeaderboardCard,
  TrendCard,
} from "@/components/admin/analytics/InsightBlocks";
import {
  Shirt,
  Briefcase,
  Layers,
  Package,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Warehouse,
  ClipboardCheck,
  Loader2,
} from "lucide-react";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        console.error("DASHBOARD_FETCH_ERROR:", err);
        setError(err.message || "An error occurred while loading the dashboard.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted">Loading dashboard intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <div className="rounded-[24px] border border-red-100 bg-red-50 p-8 text-center">
          <h2 className="text-lg font-bold text-red-900">Dashboard Error</h2>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-5 rounded-full bg-red-600 px-6 py-2 text-xs font-bold text-white transition hover:bg-red-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!data || (!data.brandCoverage?.length && !data.topProducts?.length)) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <Package className="h-12 w-12 text-muted/30" />
        <h2 className="text-lg font-bold text-foreground">No Data Found</h2>
        <p className="text-sm text-muted">The analytics engine has no current data to process.</p>
      </div>
    );
  }

  // Map API data to component formats
  const brandCatalog = (data.brandCoverage || []).map((b: any) => ({
    label: b.brand,
    products: b.items,
    variants: b.skus,
    stock: b.stock,
  }));

  const topProducts = (data.topProducts || []).map((p: any) => ({
    label: p.sku,
    sublabel: p.brand || "Brand not tagged",
    value: p.orders,
    secondary: p.value,
  }));

  const headlineMetrics = data.headline || {
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    availableUnits: 0,
    pendingApprovals: 0,
    averageOrderValue: 0,
  };

  return (
    <div className="space-y-4">
      <section className="premium-card overflow-hidden rounded-[28px]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/5 px-4 py-5">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted">
              Daily overview
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Performance at a glance
            </h1>
          </div>
        </div>

        <div className="grid gap-6 px-4 py-5 md:grid-cols-2 xl:grid-cols-4">
          <InsightMetricCard
            label="Travis Mathew"
            value={String(brandCatalog.find((b: any) => b.label?.toLowerCase().includes("travis"))?.products || 0)}
            detail="Total products currently active in the Travis Mathew catalog."
            accent="#EEF4FF"
            image={"https://callawaytech.s3.ap-south-1.amazonaws.com/omsimages/uploads/tm_thum_23fdeb8c29.png"}
          />
          <InsightMetricCard
            label="Ogio"
            value={String(brandCatalog.find((b: any) => b.label?.toLowerCase().includes("ogio"))?.products || 0)}
            detail="Products currently available in the OGIO product line."
            accent="#FFF7E6"
            image="https://callawaytech.s3.ap-south-1.amazonaws.com/omsimages/uploads/ogio_favicon_ac591c347e_8de0fee6f4.png"
          />
          <InsightMetricCard
            label="Callaway Softgoods"
            value={String(brandCatalog.find((b: any) => b.label?.toLowerCase().includes("softgoods"))?.products || 0)}
            detail="Active softgoods items ready for sales and distribution."
            accent="#ECFDF5"
            image="https://callawaytech.s3.ap-south-1.amazonaws.com/omsimages/uploads/icon_callway_f25555115b.png"
          />
          <InsightMetricCard
            label="Callaway Hardgoods"
            value={String(brandCatalog.find((b: any) => b.label?.toLowerCase().includes("hardgoods"))?.products || 0)}
            detail="Hardware and equipment products in the current inventory."
            accent="#FFF1F2"
            image="https://callawaytech.s3.ap-south-1.amazonaws.com/omsimages/uploads/icon_callway_f25555115b.png"
          />
        </div>

        <div className="grid gap-6 px-4 py-5 md:grid-cols-2 xl:grid-cols-5">
          <InsightMetricCard
            label="Order value"
            value={money.format(headlineMetrics.totalRevenue)}
            detail={`${headlineMetrics.totalOrders} live orders tracked across the workspace.`}
            accent="#EEF4FF"
            icon={CreditCard}
          />
          <InsightMetricCard
            label="Active products"
            value={String(headlineMetrics.activeProducts)}
            detail="Total products currently available to sales and admin teams."
            accent="#ECFDF5"
            icon={ShoppingBag}
          />
          <InsightMetricCard
            label="Available units"
            value={String(headlineMetrics.availableUnits)}
            detail="Stock ready to allocate across active warehouse locations."
            accent="#FFF7E6"
            icon={Warehouse}
          />
          <InsightMetricCard
            label="Pending approvals"
            value={String(headlineMetrics.pendingApprovals)}
            detail="Orders waiting on availability review or approval."
            accent="#FFF1F2"
            icon={ClipboardCheck}
          />
          <InsightMetricCard
            label="Average order"
            value={money.format(headlineMetrics.averageOrderValue)}
            detail="Average value per active order in the current system."
            accent="#F3F4F6"
            icon={TrendingUp}
          />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <TrendCard
          title="Weekly order movement"
          description="Order value and activity across the last eight weeks."
          points={data.weeklyOrderValue || []}
          formatter={(value) => money.format(value)}
        />
        <BreakdownCard
          title="Workflow focus"
          description="Where orders are currently sitting in the process."
          items={data.workflowBreakdown || []}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <BrandCatalogCard
          title="Brand coverage"
          description="Current catalog footprint by brand, including variants and available stock."
          items={brandCatalog}
        />
        <LeaderboardCard
          title="Top ordered products"
          description="Most requested items by unit count, with value underneath."
          items={topProducts}
          valuePrefix=""
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <BreakdownCard
          title="Warehouse distribution"
          description="Stock availability across active fulfillment hubs."
          items={data.warehouseBreakdown || []}
        />
        <BreakdownCard
          title="Team distribution"
          description="Current active users by responsibility."
          items={data.roleDistribution || []}
        />
        <LeaderboardCard
          title="Leading people"
          description="Team members attached to the highest order value."
          items={data.topContributors || []}
          valuePrefix=""
        />
      </div>
    </div>
  );
}
