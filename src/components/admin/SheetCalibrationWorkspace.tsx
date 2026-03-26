'use client';

import React, {useDeferredValue, useEffect, useState} from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Filter,
  Loader2,
  RefreshCcw,
  Search,
  Upload,
} from "lucide-react";
import {parseCsv, toCsv} from "@/lib/utils/csv";

type DatasetSummary = {
  id: string;
  name: string;
  slug: string;
  type: "brand_calibration" | "generic";
  sourceFileName: string;
  description?: string;
  columns: string[];
  rowCount: number;
  summary: {
    matched: number;
    partial: number;
    unmatched: number;
    issueCount: number;
  };
  createdAt: string;
};

type CalibrationRow = {
  id?: string;
  rowIndex: number;
  data: Record<string, unknown>;
  relation?: {
    status: "matched" | "partial" | "unmatched";
    brandId?: string | null;
    brandLabel?: string;
    productId?: string | null;
    productLabel?: string;
    variantId?: string | null;
    variantLabel?: string;
    warehouseId?: string | null;
    warehouseLabel?: string;
    issues: string[];
  };
};

type SheetCalibrationWorkspaceProps = {
  initialDatasets: DatasetSummary[];
  lookupSummary: {
    brands: number;
    products: number;
    variants: number;
    warehouses: number;
  };
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function relationTone(status?: "matched" | "partial" | "unmatched") {
  if (status === "matched") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
  }

  if (status === "partial") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300";
  }

  if (status === "unmatched") {
    return "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300";
  }

  return "border-border/70 bg-background text-foreground/60";
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const csv = toCsv(rows);
  const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function SheetCalibrationWorkspace({
  initialDatasets,
  lookupSummary,
}: SheetCalibrationWorkspaceProps) {
  const [datasets, setDatasets] = useState(initialDatasets);
  const [datasetName, setDatasetName] = useState("Brand Calibration Intake");
  const [datasetDescription, setDatasetDescription] = useState(
    "Upload sheets to map incoming rows against live brands, products, variants, and warehouses."
  );
  const [headers, setHeaders] = useState<string[]>([]);
  const [draftRows, setDraftRows] = useState<Record<string, unknown>[]>([]);
  const [activeDataset, setActiveDataset] = useState<DatasetSummary | null>(null);
  const [calibratedRows, setCalibratedRows] = useState<CalibrationRow[]>([]);
  const [loadingSlug, setLoadingSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [brandFilters, setBrandFilters] = useState<string[]>([]);
  const [warehouseFilters, setWarehouseFilters] = useState<string[]>([]);
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const displayRows: CalibrationRow[] = activeDataset
    ? calibratedRows
    : draftRows.map((row, index) => ({rowIndex: index + 1, data: row}));

  const displayHeaders =
    headers.length || activeDataset?.columns.length
      ? headers.length
        ? headers
        : activeDataset?.columns ?? []
      : Array.from(
          displayRows.reduce((set, row) => {
            Object.keys(row.data).forEach((key) => set.add(key));
            return set;
          }, new Set<string>())
        );

  const statusOptions = Array.from(
    calibratedRows.reduce((set, row) => {
      if (row.relation?.status) {
        set.add(row.relation.status);
      }
      return set;
    }, new Set<string>())
  );

  const brandOptions = Array.from(
    displayRows.reduce((set, row) => {
      const brandValue =
        row.relation?.brandLabel ||
        String(row.data.brandCode ?? row.data.brandName ?? row.data.brand ?? "").trim();
      if (brandValue) {
        set.add(brandValue);
      }
      return set;
    }, new Set<string>())
  ).sort((left, right) => left.localeCompare(right));

  const warehouseOptions = Array.from(
    displayRows.reduce((set, row) => {
      const warehouseValue =
        row.relation?.warehouseLabel ||
        String(row.data.warehouseCode ?? row.data.warehouseName ?? row.data.warehouse ?? "").trim();
      if (warehouseValue) {
        set.add(warehouseValue);
      }
      return set;
    }, new Set<string>())
  ).sort((left, right) => left.localeCompare(right));

  const filteredRows = displayRows.filter((row) => {
    const brandValue =
      row.relation?.brandLabel ||
      String(row.data.brandCode ?? row.data.brandName ?? row.data.brand ?? "").trim();
    const warehouseValue =
      row.relation?.warehouseLabel ||
      String(row.data.warehouseCode ?? row.data.warehouseName ?? row.data.warehouse ?? "").trim();

    if (statusFilters.length && (!row.relation?.status || !statusFilters.includes(row.relation.status))) {
      return false;
    }

    if (brandFilters.length && !brandFilters.includes(brandValue)) {
      return false;
    }

    if (warehouseFilters.length && !warehouseFilters.includes(warehouseValue)) {
      return false;
    }

    if (issuesOnly && !(row.relation?.issues.length ?? 0)) {
      return false;
    }

    if (!deferredQuery) {
      return true;
    }

    const haystack = [
      ...Object.keys(row.data),
      ...Object.values(row.data).map((value) => String(value ?? "")),
      row.relation?.status ?? "",
      row.relation?.brandLabel ?? "",
      row.relation?.productLabel ?? "",
      row.relation?.variantLabel ?? "",
      row.relation?.warehouseLabel ?? "",
      ...(row.relation?.issues ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(deferredQuery);
  });

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const visibleRows = filteredRows.slice(pageStart, pageStart + pageSize);

  const brandSummary = Array.from(
    calibratedRows.reduce((map, row) => {
      const label =
        row.relation?.brandLabel ||
        String(row.data.brandCode ?? row.data.brandName ?? row.data.brand ?? "Unclassified");
      const entry =
        map.get(label) ?? {label, matched: 0, partial: 0, unmatched: 0, total: 0};
      entry.total += 1;
      if (row.relation?.status) {
        entry[row.relation.status] += 1;
      }
      map.set(label, entry);
      return map;
    }, new Map<string, {label: string; matched: number; partial: number; unmatched: number; total: number}>())
      .values()
  ).sort((left, right) => right.total - left.total);

  const activeFilterCount =
    statusFilters.length +
    brandFilters.length +
    warehouseFilters.length +
    (issuesOnly ? 1 : 0);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  async function openDataset(slug: string) {
    setLoadingSlug(slug);

    try {
      const response = await fetch(`/api/admin/sheets/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to load dataset");
      }

      const payload = (await response.json()) as {
        dataset: DatasetSummary;
        rows: CalibrationRow[];
      };

      setActiveDataset(payload.dataset);
      setCalibratedRows(payload.rows);
      setHeaders(payload.dataset.columns);
      setDraftRows([]);
      clearFilters();
      setPage(1);
    } catch (error) {
      console.error(error);
      window.alert("Failed to open dataset.");
    } finally {
      setLoadingSlug("");
    }
  }

  async function loadSampleCsv() {
    try {
      const response = await fetch("/sample-data/brand-calibration.csv");
      const csvText = await response.text();
      const parsed = parseCsv(csvText);
      setHeaders(parsed.headers);
      setDraftRows(parsed.rows);
      setActiveDataset(null);
      setCalibratedRows([]);
      clearFilters();
      setDatasetName("Brand Calibration Sample");
      setDatasetDescription("Loaded from the default CSV shipped with CallawayOne.");
      setPage(1);
    } catch (error) {
      console.error(error);
      window.alert("Failed to load the default sample CSV.");
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      window.alert("Only CSV uploads are enabled in this first pass.");
      event.target.value = "";
      return;
    }

    try {
      const csvText = await file.text();
      const parsed = parseCsv(csvText);
      setHeaders(parsed.headers);
      setDraftRows(parsed.rows);
      setActiveDataset(null);
      setCalibratedRows([]);
      clearFilters();
      setDatasetName(file.name.replace(/\.[^.]+$/, ""));
      setDatasetDescription(`Uploaded from ${file.name}.`);
      setPage(1);
    } catch (error) {
      console.error(error);
      window.alert("Failed to parse the uploaded CSV.");
    } finally {
      event.target.value = "";
    }
  }

  async function saveDraftAsDataset() {
    if (!draftRows.length) {
      window.alert("Load the default CSV or upload a CSV before saving.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/sheets", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          name: datasetName,
          description: datasetDescription,
          sourceFileName: `${datasetName || "sheet"}.csv`,
          type: "brand_calibration",
          columns: headers,
          rows: draftRows,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save dataset");
      }

      const payload = (await response.json()) as {
        dataset: DatasetSummary;
        rows: CalibrationRow[];
      };

      setDatasets((current) => [payload.dataset, ...current]);
      setActiveDataset(payload.dataset);
      setCalibratedRows(payload.rows);
      setHeaders(payload.dataset.columns);
      setDraftRows([]);
      clearFilters();
      setPage(1);
    } catch (error) {
      console.error(error);
      window.alert("Failed to save and calibrate dataset.");
    } finally {
      setSaving(false);
    }
  }

  function clearFilters() {
    setStatusFilters([]);
    setBrandFilters([]);
    setWarehouseFilters([]);
    setIssuesOnly(false);
    setQuery("");
    setPage(1);
  }

  function exportCurrentRows() {
    if (activeDataset?.slug) {
      window.open(`/api/admin/sheets/${activeDataset.slug}?format=csv`, "_blank");
      return;
    }

    if (!displayRows.length) {
      return;
    }

    downloadCsv(
      `${datasetName || "sheet-preview"}.csv`,
      displayRows.map((row) => ({
        rowIndex: row.rowIndex,
        ...row.data,
      }))
    );
  }

  return (
    <div className="space-y-4">
      <section className="premium-card overflow-hidden rounded-[28px]">
        <div className="grid gap-4 border-b border-border/60 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/42">
              Sheet calibration workspace
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <h2 className="text-[1.85rem] font-semibold tracking-tight text-foreground">
                CSV Intake and Mapping
              </h2>
              <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">
                Derived from OLD/call-check
              </span>
            </div>
            <p className="max-w-4xl text-sm text-foreground/62">
              Import and calibrate data directly into your database.
            </p>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <MetricTile label="Brands" value={String(lookupSummary.brands)} icon={<FileSpreadsheet className="h-4 w-4" />} />
              <MetricTile label="Products" value={String(lookupSummary.products)} icon={<CheckCircle2 className="h-4 w-4" />} />
              <MetricTile label="Variants" value={String(lookupSummary.variants)} icon={<Filter className="h-4 w-4" />} />
              <MetricTile label="Warehouses" value={String(lookupSummary.warehouses)} icon={<Upload className="h-4 w-4" />} />
            </div>
          </div>

          <div className="rounded-[24px] border border-border/70 bg-background/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42">
              Process
            </p>
            <ol className="mt-3 space-y-2 text-sm text-foreground/62">
              <li>1. Load the default sample or upload a CSV.</li>
              <li>2. Review the raw sheet in the aligned preview table.</li>
              <li>3. Save to calibrate rows against brands, products, variants, and warehouses.</li>
              <li>4. Reopen any saved dataset and export the result.</li>
            </ol>
            <div className="mt-4">
              <Link
                href="/sample-data/brand-calibration.csv"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                <Download className="h-4 w-4" />
                Download default CSV
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/46">
                  Dataset name
                </span>
                <input
                  value={datasetName}
                  onChange={(event) => setDatasetName(event.target.value)}
                  className="w-full rounded-[20px] border border-border/70 bg-background px-4 py-3 text-sm"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/46">
                  Description
                </span>
                <input
                  value={datasetDescription}
                  onChange={(event) => setDatasetDescription(event.target.value)}
                  className="w-full rounded-[20px] border border-border/70 bg-background px-4 py-3 text-sm"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={loadSampleCsv}
                className="inline-flex items-center gap-2 rounded-[20px] border border-border/70 bg-background px-4 py-3 text-sm font-semibold text-foreground/76"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Load default CSV
              </button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-[20px] border border-border/70 bg-background px-4 py-3 text-sm font-semibold text-foreground/76">
                <Upload className="h-4 w-4" />
                Upload CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
              <button
                onClick={saveDraftAsDataset}
                disabled={!draftRows.length || saving}
                className="inline-flex items-center gap-2 rounded-[20px] bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Calibrate and save
              </button>
              <button
                onClick={exportCurrentRows}
                disabled={!displayRows.length}
                className="inline-flex items-center gap-2 rounded-[20px] border border-border/70 bg-background px-4 py-3 text-sm font-semibold text-foreground/76 disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                Export current
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <MetricTile label="Preview rows" value={String(displayRows.length)} icon={<FileSpreadsheet className="h-4 w-4" />} />
              <MetricTile label="Matched" value={String(activeDataset?.summary.matched ?? 0)} icon={<CheckCircle2 className="h-4 w-4" />} />
              <MetricTile label="Partial" value={String(activeDataset?.summary.partial ?? 0)} icon={<AlertTriangle className="h-4 w-4" />} />
              <MetricTile label="Issues" value={String(activeDataset?.summary.issueCount ?? 0)} icon={<AlertTriangle className="h-4 w-4" />} />
            </div>
          </div>

          <div className="rounded-[24px] border border-border/70 bg-background/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42">
                  Saved datasets
                </p>
                <p className="text-sm text-foreground/56">
                  Saved calibration sets ready to reopen and compare.
                </p>
              </div>
              <span className="rounded-full border border-border/70 px-3 py-1 text-xs font-semibold text-foreground/52">
                {datasets.length}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {datasets.length ? (
                datasets.map((dataset) => (
                  <button
                    key={dataset.id}
                    onClick={() => openDataset(dataset.slug)}
                    className={`w-full rounded-[20px] border px-3 py-3 text-left transition ${
                      activeDataset?.slug === dataset.slug
                        ? "border-primary/20 bg-primary/10"
                        : "border-border/70 bg-[color:var(--surface)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{dataset.name}</p>
                        <p className="mt-1 text-xs text-foreground/48">
                          {dataset.rowCount} rows · {new Date(dataset.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      {loadingSlug === dataset.slug ? (
                        <Loader2 className="h-4 w-4 animate-spin text-foreground/55" />
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${relationTone("matched")}`}>
                        {dataset.summary.matched} matched
                      </span>
                      <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${relationTone("partial")}`}>
                        {dataset.summary.partial} partial
                      </span>
                      <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${relationTone("unmatched")}`}>
                        {dataset.summary.unmatched} unmatched
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-[20px] border border-dashed border-border/70 bg-[color:var(--surface)] px-4 py-6 text-sm text-foreground/56">
                  No datasets saved yet. Load the sample CSV and save it to create the first calibration set.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {activeDataset && brandSummary.length ? (
        <section className="premium-card overflow-clip rounded-[28px]">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Brand relation board</h3>
              <p className="text-sm text-foreground/56">
                Separate table for brand-level calibration health, derived from the saved dataset.
              </p>
            </div>
          </div>
          <div className="w-full max-h-[400px] overflow-auto rounded-b-[24px]">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="bg-[#111111] text-white">
                  <StickyHeading className="px-4 py-3">Brand reference</StickyHeading>
                  <StickyHeading className="px-4 py-3">Total rows</StickyHeading>
                  <StickyHeading className="px-4 py-3">Matched</StickyHeading>
                  <StickyHeading className="px-4 py-3">Partial</StickyHeading>
                  <StickyHeading className="px-4 py-3">Unmatched</StickyHeading>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {brandSummary.map((entry) => (
                  <tr key={entry.label}>
                    <td className="px-4 py-3 font-semibold text-foreground">{entry.label}</td>
                    <td className="px-4 py-3 text-foreground/72">{entry.total}</td>
                    <td className="px-4 py-3 text-foreground/72">{entry.matched}</td>
                    <td className="px-4 py-3 text-foreground/72">{entry.partial}</td>
                    <td className="px-4 py-3 text-foreground/72">{entry.unmatched}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="premium-card overflow-clip rounded-[28px]">
        <div className="space-y-4 border-b border-border/60 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {activeDataset ? activeDataset.name : draftRows.length ? "Draft preview" : "Preview table"}
              </h3>
              <p className="text-sm text-foreground/56">
                Preview uploaded rows and identify mapping issues.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="premium-search flex items-center gap-3 rounded-[20px] px-4 py-3">
                <Search className="h-4 w-4 text-foreground/45" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search cells, status, issues, brand, warehouse, or product references"
                  className="w-[280px] border-none bg-transparent p-0 text-sm"
                />
              </label>
              <label className="inline-flex items-center gap-2 rounded-[20px] border border-border/70 bg-background px-4 py-3 text-sm font-semibold text-foreground/76">
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                  className="border-none bg-transparent p-0 pr-6 text-sm font-semibold"
                >
                  {PAGE_SIZE_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value} / page
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() =>
                  setStatusFilters((current) =>
                    current.includes(status)
                      ? current.filter((value) => value !== status)
                      : [...current, status]
                  )
                }
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${
                  statusFilters.includes(status) ? relationTone(status as "matched" | "partial" | "unmatched") : "border-border/70 bg-background text-foreground/64"
                }`}
              >
                {status}
              </button>
            ))}

            {brandOptions.slice(0, 8).map((brand) => (
              <button
                key={brand}
                onClick={() =>
                  setBrandFilters((current) =>
                    current.includes(brand)
                      ? current.filter((value) => value !== brand)
                      : [...current, brand]
                  )
                }
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  brandFilters.includes(brand)
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border/70 bg-background text-foreground/64"
                }`}
              >
                {brand}
              </button>
            ))}

            {warehouseOptions.slice(0, 4).map((warehouse) => (
              <button
                key={warehouse}
                onClick={() =>
                  setWarehouseFilters((current) =>
                    current.includes(warehouse)
                      ? current.filter((value) => value !== warehouse)
                      : [...current, warehouse]
                  )
                }
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  warehouseFilters.includes(warehouse)
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border/70 bg-background text-foreground/64"
                }`}
              >
                {warehouse}
              </button>
            ))}

            <button
              onClick={() => setIssuesOnly((current) => !current)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                issuesOnly
                  ? "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300"
                  : "border-border/70 bg-background text-foreground/64"
              }`}
            >
              Issues only
            </button>

            {activeFilterCount ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        <div className="w-full max-h-[calc(100vh-250px)] overflow-auto rounded-b-[24px]">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-[#111111] text-white">
                <StickyHeading className="min-w-[80px] px-4 py-3">Row</StickyHeading>
                <StickyHeading className="min-w-[130px] px-4 py-3">Status</StickyHeading>
                <StickyHeading className="min-w-[180px] px-4 py-3">Brand</StickyHeading>
                <StickyHeading className="min-w-[200px] px-4 py-3">Warehouse</StickyHeading>
                <StickyHeading className="min-w-[220px] px-4 py-3">Product</StickyHeading>
                <StickyHeading className="min-w-[220px] px-4 py-3">Variant</StickyHeading>
                <StickyHeading className="min-w-[260px] px-4 py-3">Issues</StickyHeading>
                {displayHeaders.map((header) => (
                  <StickyHeading key={header} className="min-w-[180px] px-4 py-3">
                    {header}
                  </StickyHeading>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[color:var(--surface)]">
              {visibleRows.length ? (
                visibleRows.map((row) => (
                  <tr key={`${row.id ?? "draft"}-${row.rowIndex}`} className="border-b border-border/60 transition-colors hover:bg-primary/5">
                    <td className="border-b border-border/60 px-4 py-3 align-top font-semibold text-foreground">
                      {row.rowIndex}
                    </td>
                    <td className="border-b border-border/60 px-4 py-3 align-top">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${relationTone(row.relation?.status)}`}>
                        {row.relation?.status ?? "draft"}
                      </span>
                    </td>
                    <td className="border-b border-border/60 px-4 py-3 align-top text-sm text-foreground/72">
                      {row.relation?.brandLabel || String(row.data.brandCode ?? row.data.brandName ?? row.data.brand ?? "—")}
                    </td>
                    <td className="border-b border-border/60 px-4 py-3 align-top text-sm text-foreground/72">
                      {row.relation?.warehouseLabel || String(row.data.warehouseCode ?? row.data.warehouseName ?? row.data.warehouse ?? "—")}
                    </td>
                    <td className="border-b border-border/60 px-4 py-3 align-top text-sm text-foreground/72">
                      {row.relation?.productLabel || String(row.data.baseSku ?? row.data.productName ?? row.data.name ?? "—")}
                    </td>
                    <td className="border-b border-border/60 px-4 py-3 align-top text-sm text-foreground/72">
                      {row.relation?.variantLabel || String(row.data.sku ?? row.data.variantSku ?? "—")}
                    </td>
                    <td className="border-b border-border/60 px-4 py-3 align-top">
                      {row.relation?.issues.length ? (
                        <div className="space-y-1">
                          {row.relation.issues.map((issue) => (
                            <p key={issue} className="text-xs text-danger">
                              {issue}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-foreground/45">No issues</span>
                      )}
                    </td>
                    {displayHeaders.map((header) => (
                      <td key={header} className="border-b border-border/60 px-4 py-3 align-top text-sm text-foreground/72">
                        {String(row.data[header] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7 + displayHeaders.length} className="px-6 py-14 text-center">
                    <div className="mx-auto max-w-md">
                      <h3 className="text-base font-semibold text-foreground">No rows in this filter state</h3>
                      <p className="mt-2 text-sm text-foreground/56">
                        Load the default sample, upload a CSV, or clear the active filter chips to repopulate the preview.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
          <div className="text-sm text-foreground/56">
            Page {currentPage} of {pageCount} · {filteredRows.length} rows after filters
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="rounded-2xl border border-border/70 bg-background px-3 py-2 text-sm font-semibold text-foreground/70 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={currentPage === pageCount}
              className="rounded-2xl border border-border/70 bg-background px-3 py-2 text-sm font-semibold text-foreground/70 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-border/70 bg-background/75 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
          {label}
        </p>
        <span className="text-foreground/45">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function StickyHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`bg-[#111] text-white shadow-[0_1px_0_rgba(255,255,255,0.08)] ${className || ""}`}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/82">
        {children}
      </div>
    </th>
  );
} 
