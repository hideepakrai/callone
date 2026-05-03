import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { isAdminRole } from "@/lib/auth/permissions";
import { buildDashboardResponse } from "@/lib/admin/dashboard-response";
import { loadInsightsData } from "@/lib/admin/load-insights-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawData = await loadInsightsData();
    const responseData = buildDashboardResponse(rawData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("DASHBOARD_API_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load dynamic dashboard data" },
      { status: 500 }
    );
  }
}
