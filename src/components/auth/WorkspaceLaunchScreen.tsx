"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Database, LoaderCircle, ShieldCheck, TerminalSquare } from "lucide-react";

type StepStatus = "idle" | "loading" | "ready" | "error";

type LoadStep = {
  key: string;
  label: string;
  status: StepStatus;
  count?: number;
  durationMs?: number;
  message?: string;
};

const PRELOAD_STORAGE_KEY = "callone.dashboard.preload.v1";

const DEFAULT_STEP_KEYS = [
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

function toTitle(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function WorkspaceLaunchScreen({ target }: { target: string }) {
  const router = useRouter();
  const [steps, setSteps] = useState<LoadStep[]>(
    DEFAULT_STEP_KEYS.map((key) => ({
      key,
      label: key,
      status: "idle",
    }))
  );
  const [sessionState, setSessionState] = useState<
    "booting" | "redirecting" | "failed"
  >("booting");
  const [statusLine, setStatusLine] = useState("Attaching to workspace runtime...");
  const [errorMessage, setErrorMessage] = useState("");
  const [logs, setLogs] = useState<string[]>([
    "[boot] session accepted",
    "[boot] preparing dashboard collections",
  ]);
  const finishedRef = useRef(false);

  useEffect(() => {
    const stream = new EventSource("/api/dashboard/stream");

    const appendLog = (line: string) => {
      setLogs((current) => [...current.slice(-8), line]);
    };

    stream.addEventListener("init", (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as {
        steps?: string[];
      };

      if (payload.steps?.length) {
        setSteps(
          payload.steps.map((key) => ({
            key,
            label: key,
            status: "idle",
          }))
        );
      }

      setStatusLine("Handshake complete. Loading workspace collections...");
    });

    stream.addEventListener("progress", (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as LoadStep;

      setSteps((current) =>
        current.map((step) =>
          step.key === payload.key
            ? {
                ...step,
                ...payload,
                status: payload.status,
              }
            : step
        )
      );

      if (payload.message) {
        setStatusLine(payload.message);
        appendLog(
          `[${payload.status}] ${payload.label}${
            typeof payload.count === "number" ? ` (${payload.count})` : ""
          }`
        );
      }
    });

    stream.addEventListener("complete", (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as {
        payload: unknown;
      };

      try {
        sessionStorage.setItem(PRELOAD_STORAGE_KEY, JSON.stringify(payload.payload));
      } catch {
        appendLog("[warn] session storage unavailable, falling back to live fetch");
      }

      finishedRef.current = true;
      setSessionState("redirecting");
      setStatusLine("Workspace caches are primed. Opening dashboard...");
      appendLog("[done] dashboard payload assembled");
      stream.close();
      router.replace(target || "/admin");
    });

    stream.addEventListener("error", (event) => {
      if (finishedRef.current) {
        return;
      }

      let message = "Dashboard bootstrap failed.";

      if (event instanceof MessageEvent && event.data) {
        try {
          const payload = JSON.parse(event.data) as { message?: string };
          message = payload.message || message;
        } catch {
          message = event.data;
        }
      }

      setSessionState("failed");
      setErrorMessage(message);
      setStatusLine("Workspace bootstrap failed.");
      appendLog(`[error] ${message}`);
      stream.close();
    });

    return () => {
      stream.close();
    };
  }, [router, target]);

  const readyCount = useMemo(
    () => steps.filter((step) => step.status === "ready").length,
    [steps]
  );
  const progressPercent = steps.length ? Math.round((readyCount / steps.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
        <div className="grid flex-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                  Workspace Boot
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
                  Technical status feed
                </h1>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200">
                {sessionState === "failed"
                  ? "Boot Failed"
                  : sessionState === "redirecting"
                    ? "Redirecting"
                    : "Initializing"}
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-white/8 bg-black/40 p-5">
              <div className="flex items-center gap-3 text-sm text-white/82">
                {sessionState === "failed" ? (
                  <ShieldCheck className="h-4 w-4 text-rose-300" />
                ) : (
                  <LoaderCircle className="h-4 w-4 animate-spin text-emerald-300" />
                )}
                <span>{statusLine}</span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#22c55e,#38bdf8)] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                <span>{readyCount} / {steps.length} collections ready</span>
                <span>{progressPercent}%</span>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {steps.map((step) => (
                <div
                  key={step.key}
                  className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
                        Collection
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-white">
                        {toTitle(step.label)}
                      </p>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                        step.status === "ready"
                          ? "bg-emerald-400/14 text-emerald-200"
                          : step.status === "error"
                            ? "bg-rose-400/14 text-rose-200"
                            : step.status === "loading"
                              ? "bg-sky-400/14 text-sky-200"
                              : "bg-white/8 text-white/40"
                      }`}
                    >
                      {step.status}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-white/58">
                    <span>{step.count ?? "--"} rows</span>
                    <span>
                      {typeof step.durationMs === "number"
                        ? `${(step.durationMs / 1000).toFixed(2)}s`
                        : "--"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="rounded-[32px] border border-white/10 bg-[#0a0a0a] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <div className="flex items-center gap-3">
                <TerminalSquare className="h-5 w-5 text-cyan-300" />
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/72">
                  Runtime Console
                </p>
              </div>
              <div className="mt-5 rounded-[24px] border border-white/8 bg-[#020202] p-4 font-mono text-[12px] leading-6 text-emerald-300">
                {logs.map((line, index) => (
                  <div key={`${line}-${index}`} className="whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3 text-cyan-200">
                  <Database className="h-5 w-5" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                    Data Gate
                  </p>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/68">
                  The dashboard opens only after the required Mongo collections finish loading and the payload is compiled.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3 text-emerald-200">
                  <Activity className="h-5 w-5" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                    Live Status
                  </p>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/68">
                  Counts and timings reflect actual server-side collection reads, not simulated progress bars.
                </p>
              </div>
            </div>

            {sessionState === "failed" ? (
              <div className="rounded-[28px] border border-rose-400/20 bg-rose-400/8 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-200">
                  Boot Error
                </p>
                <p className="mt-3 text-sm leading-6 text-rose-50/88">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-5 rounded-2xl border border-rose-300/30 bg-rose-200/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-100"
                >
                  Retry Bootstrap
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
