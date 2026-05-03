import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { isAdminRole } from "@/lib/auth/permissions";
import { buildDashboardResponse } from "@/lib/admin/dashboard-response";
import {
  loadInsightsData,
  type DashboardLoadProgress,
  type DashboardLoadStepKey,
} from "@/lib/admin/load-insights-data";

export const dynamic = "force-dynamic";

const STEP_ORDER: DashboardLoadStepKey[] = [
  "orders",
  "products",
  "variants",
  "brands",
  "users",
  "inventory_levels",
  "warehouses",
  "product_hardgoods",
  "product_ogio",
  "product_softgoods",
  "product_travis",
];

function sseChunk(event: string, payload: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !isAdminRole(session.user.role)) {
    return new Response(
      sseChunk("error", { message: "Unauthorized" }),
      {
        status: 401,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const push = (event: string, payload: unknown) => {
        controller.enqueue(encoder.encode(sseChunk(event, payload)));
      };

      try {
        push("init", {
          steps: STEP_ORDER,
          startedAt: Date.now(),
        });

        const progressEvents: DashboardLoadProgress[] = [];
        const rawData = await loadInsightsData({
          onProgress: async (progress) => {
            progressEvents.push(progress);
            push("progress", progress);
          },
        });

        push("progress", {
          key: "dashboard_payload",
          label: "dashboard_payload",
          status: "loading",
          message: "Compiling dashboard payload...",
        });

        const payload = buildDashboardResponse(rawData);

        push("complete", {
          payload,
          completedAt: Date.now(),
          steps: progressEvents,
        });
      } catch (error) {
        push("error", {
          message:
            error instanceof Error
              ? error.message
              : "Dashboard stream failed unexpectedly.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
