"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Clock3, Search, Sparkles } from "lucide-react";

const suggestedPrompts = [
  {
    title: "Review delayed order approvals",
    description: "Summarize the orders waiting on approval and tell me which manager decision is blocking them.",
  },
  {
    title: "Prepare a product import checklist",
    description: "List the import steps and risks before loading a new brand calibration sheet.",
  },
  {
    title: "Compare brand catalog movement",
    description: "Show me which product families are moving faster across Callaway, Ogio, and Travis Mathew.",
  },
  {
    title: "Audit account operations",
    description: "Help me review role assignments, retailer coverage, and warehouse ownership gaps.",
  },
] as const;

const recentWork = [
  "Which orders need attention before end of day?",
  "Create a plan for cleaning up warehouse mismatches.",
  "Summarize the next actions for the products team this week.",
] as const;

const workModes = [
  "Operations",
  "Catalog",
  "Accounts",
  "Imports",
] as const;

export function AiAdminHome() {
  const [draft, setDraft] = useState("");
  const [activeMode, setActiveMode] = useState<(typeof workModes)[number]>("Operations");

  const previewText = useMemo(() => {
    const text = draft.trim();
    if (text.length) return text;
    return `Ask about ${activeMode.toLowerCase()} work using the current Callaway admin process and navigation context.`;
  }, [activeMode, draft]);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col rounded-[32px] border border-border bg-surface shadow-[var(--premium-card-shadow)]">
        <div className="border-b border-border px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                <Sparkles size={14} />
                AI Admin Home
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-5xl">
                A chat-first workspace for Callaway operations.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground/72 sm:text-base">
                Use one focused workspace to think through orders, products, imports, accounts, warehouses, and reporting tasks without leaving the admin context.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {workModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setActiveMode(mode)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    activeMode === mode
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-surface-muted text-foreground hover:bg-control-bg-hover"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid flex-1 gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-[28px] border border-border bg-surface-muted p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background">
                  <Search size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Suggested prompts</p>
                  <p className="text-xs text-foreground/62">Built around the current business process.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt.title}
                    type="button"
                    onClick={() => setDraft(prompt.description)}
                    className="rounded-[24px] border border-border bg-surface px-5 py-5 text-left transition hover:-translate-y-0.5 hover:bg-surface-elevated"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-base font-semibold text-foreground">{prompt.title}</p>
                      <ArrowUpRight size={16} className="text-foreground/42" />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-foreground/68">{prompt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Composer preview</p>
                  <p className="mt-1 text-xs text-foreground/62">
                    Presentational v1 surface for future AI-driven admin work.
                  </p>
                </div>
                <div className="rounded-full border border-border bg-surface-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                  {activeMode}
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-border bg-background px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                  Prompt intent
                </p>
                <p className="mt-3 text-sm leading-7 text-foreground/78">{previewText}</p>
              </div>
            </div>
          </section>

          <section className="flex flex-col rounded-[28px] border border-border bg-background">
            <div className="border-b border-border px-5 py-4">
              <p className="text-sm font-semibold text-foreground">Conversation</p>
              <p className="mt-1 text-xs text-foreground/62">
                Lightweight chat home aligned with existing admin colors and typography.
              </p>
            </div>

            <div className="flex-1 space-y-4 px-5 py-5">
              <div className="ml-auto max-w-[85%] rounded-[24px] rounded-br-md bg-foreground px-4 py-3 text-sm leading-6 text-background">
                Help me prioritize the next {activeMode.toLowerCase()} task across the current admin workflow.
              </div>
              <div className="max-w-[88%] rounded-[24px] rounded-bl-md border border-border bg-surface px-4 py-3 text-sm leading-6 text-foreground/76">
                Use the starter cards to shape a task, then continue with a chat-style workflow focused on the current Callaway business process.
              </div>
            </div>

            <div className="border-t border-border px-5 py-4">
              <div className="rounded-[26px] border border-border bg-surface px-4 py-4">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={`Ask about ${activeMode.toLowerCase()} work, route navigation, or business process decisions.`}
                  className="min-h-[120px] w-full resize-none bg-transparent text-sm leading-7 text-foreground outline-none placeholder:text-foreground/40"
                />
                <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-[11px] font-semibold text-foreground/72">
                      Current navigation
                    </span>
                    <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-[11px] font-semibold text-foreground/72">
                      Business context
                    </span>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
                  >
                    Start conversation
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-border px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface-muted text-foreground">
              <Clock3 size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Recent admin questions</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {recentWork.map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => setDraft(entry)}
                    className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-semibold text-foreground/72 transition hover:bg-control-bg-hover"
                  >
                    {entry}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
