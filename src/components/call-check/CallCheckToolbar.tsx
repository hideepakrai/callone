'use client';

import {Columns, Download, Loader2, Moon, Save, Search, Sun, Upload} from "lucide-react";

type CallCheckToolbarProps = {
  hasData: boolean;
  isSaving: boolean;
  isDarkGrid: boolean;
  onOpenFile: () => void;
  onAutoSize: () => void;
  onExport: () => void;
  onSave: () => void;

  onToggleGridTheme: () => void;
  onSearchChange: (value: string) => void;
};

export function CallCheckToolbar({
  hasData,
  isSaving,
  isDarkGrid,
  onOpenFile,
  onAutoSize,
  onExport,
  onSave,

  onToggleGridTheme,
  onSearchChange,
}: CallCheckToolbarProps) {
  return (
    <>
      <div className="premium-card overflow-hidden rounded-[28px]">
        <div className="grid gap-4 border-b border-border/60 px-5 py-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/42">
              Spreadsheet intake
            </p>
            <h2 className="text-[1.85rem] font-semibold tracking-tight text-foreground">
              Call-check data manager
            </h2>
            <p className="max-w-4xl text-sm text-foreground/62">
              Keep the original call-check workflow: upload spreadsheets, inspect the rows in AG Grid,
              reopen saved datasets, and persist row edits back to MongoDB.
            </p>
          </div>

          <div className="rounded-[24px] border border-border/70 bg-background/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42">
              Workflow
            </p>
            <ol className="mt-3 space-y-2 text-sm text-foreground/62">
              <li>1. Open an Excel, CSV, or public sheet URL.</li>
              <li>2. Review and filter the rows in AG Grid.</li>
              <li>3. Save the sheet as a reusable dataset.</li>
              <li>4. Edit rows live and reopen any saved dataset later.</li>
            </ol>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenFile}
              className="inline-flex items-center gap-2 rounded-[18px] border border-border/70 bg-background px-4 py-2.5 text-sm font-semibold text-foreground/76"
            >
              <Upload className="h-4 w-4" />
              Open file
            </button>
            <button
              type="button"
              onClick={onAutoSize}
              disabled={!hasData}
              className="inline-flex items-center gap-2 rounded-[18px] border border-border/70 bg-background px-4 py-2.5 text-sm font-semibold text-foreground/76 disabled:opacity-60"
            >
              <Columns className="h-4 w-4" />
              Auto-fit
            </button>
            <button
              type="button"
              onClick={onExport}
              disabled={!hasData}
              className="inline-flex items-center gap-2 rounded-[18px] border border-border/70 bg-background px-4 py-2.5 text-sm font-semibold text-foreground/76 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!hasData || isSaving}
              className="inline-flex items-center gap-2 rounded-[18px] bg-primary px-4 py-2.5 text-sm font-semibold text-background disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save to database
            </button>
     
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="relative block min-w-[260px] max-w-[360px] flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/42" />
              <input
                type="text"
                placeholder="Search all data"
                onChange={(event) => onSearchChange(event.target.value)}
                className="w-full rounded-[18px] border border-border/70 bg-background px-11 py-2.5 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={onToggleGridTheme}
              className="inline-flex items-center gap-2 rounded-[18px] border border-border/70 bg-background px-4 py-2.5 text-sm font-semibold text-foreground/76"
            >
              {isDarkGrid ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              Grid theme
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
