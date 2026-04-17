'use client';

import React from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, ArrowDownUp, ChevronsUpDown, X, RefreshCcw, Check, LayoutGrid, Layers } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import ShowAppliedfilter from "./productTable/ShowAppliedfilter";
const SORT_OPTIONS = [
  { value: "latest", label: "Latest updated" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "stock-desc", label: "Stock high to low" },
  { value: "variants-desc", label: "Most variants" },
  { value: "brand-asc", label: "Brand A-Z" },
] as const;

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface CatalogHeaderProps {
  badgeLabel: string;
  title: string;
  totalCount: number;
  description: string;
  isSourceReadonly: boolean;
  importHref: string;
  importLabel: string;
  handleImport: () => void;
  exportVisible: () => void;
  newProductHref: string | null;
  newProductLabel: string;
  sourceNotice: string;
  query: string;
  setQuery: (q: string) => void;
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean | ((curr: boolean) => boolean)) => void;
  activeFilterCount: number;
  sortBy: string;
  setSortBy: (val: any) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  visibleCount: number;
  availableStock: number;
  selectedIdsCount: number;
  brandOptions: string[];
  brandFilters: string[];
  setBrandFilters: (fn: (curr: string[]) => string[]) => void;
  statusOptions: string[];
  statusFilters: string[];
  setStatusFilters: (fn: (curr: string[]) => string[]) => void;
  productTypeOptions: string[];
  typeFilters: string[];
  setTypeFilters: (fn: (curr: string[]) => string[]) => void;
  categoryOptions: string[];
  categoryFilters: string[];
  setCategoryFilters: (fn: (curr: string[]) => string[]) => void;
  attributeCatalog: any[];
  attributeFilters: Record<string, string[]>;
  setAttributeFilters: (fn: (curr: Record<string, string[]>) => Record<string, string[]>) => void;
  availableOnly: boolean;
  setAvailableOnly: (val: boolean) => void;
  viewMode: "product" | "sku";
  setViewMode: (mode: "product" | "sku") => void;
  appliedFilters: any[];
  clearAllFilters: () => void;
}

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function CatalogHeader({
  badgeLabel,
  title,
  totalCount,
  description,
  isSourceReadonly,
  importHref,
  importLabel,
  handleImport,
  exportVisible,
  newProductHref,
  newProductLabel,
  sourceNotice,
  query,
  setQuery,
  filterPanelOpen,
  setFilterPanelOpen,
  activeFilterCount,
  sortBy,
  setSortBy,
  pageSize,
  setPageSize,
  visibleCount,
  availableStock,
  selectedIdsCount,
  brandOptions,
  brandFilters,
  setBrandFilters,
  statusOptions,
  statusFilters,
  setStatusFilters,
  productTypeOptions,
  typeFilters,
  setTypeFilters,
  categoryOptions,
  categoryFilters,
  setCategoryFilters,
  attributeCatalog,
  attributeFilters,
  setAttributeFilters,
  availableOnly,
  setAvailableOnly,
  viewMode,
  setViewMode,
  appliedFilters,
  clearAllFilters,
}: CatalogHeaderProps) {
const {currentAttribute} = useSelector((state:RootState) => state.attribute);

console.log("categoryFilters",categoryFilters)
console.log("appliedFilters",appliedFilters)
 const handleDownloadSample = async () => {
    if (!currentAttribute?.attributes) return;

    // ✅ Filter active attributes
    const activeAttributes = currentAttribute.attributes.filter(
      (attr) => attr.isActive !== false
    );

    // ✅ Extract column keys
    const columns = activeAttributes.map((attr) => attr.key || "");

    // ✅ Create workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sample");

    // ✅ Add header row
    sheet.addRow(columns);

    // ✅ Generate sample data (based on type)
    const generateSampleValue = (attr: any, index: number) => {
      switch (attr.type) {
        case "number":
          return index * 10 + 10;
        case "text":
        default:
          return `${attr.key}_${index + 1}`;
      }
    };

    // ✅ Add 3 sample rows
    for (let i = 0; i < 3; i++) {
      const row = activeAttributes.map((attr) =>
        generateSampleValue(attr, i)
      );
      sheet.addRow(row);
    }

    // ✅ Auto width (optional but nice)
    sheet.columns.forEach((col: any) => {
      col.width = 20;
    });

    // ✅ Generate file
    const buffer = await workbook.xlsx.writeBuffer();

    // ✅ Download
    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${currentAttribute.key || "sample"}_products.xlsx`);
  };
    console.log(currentAttribute);
  
  return (
    <section className="premium-card overflow-hidden rounded-[28px]">
      <div className="grid gap-3 border-b border-white/8 px-4 py-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-foreground/42">
            {badgeLabel}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[1.85rem] font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/55">
              {totalCount} total
            </span>
          </div>
          <p className="max-w-4xl text-sm leading-6 text-foreground/58">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
              onClick={handleDownloadSample}
              className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-foreground/76 transition hover:border-white/18 hover:bg-white/[0.06]"
            >
              Sample Download
            </button>
          {isSourceReadonly ? (
            <Link
              href={importHref}
              className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-foreground/76 transition hover:border-white/18 hover:bg-white/[0.06]"
            >
              {importLabel}
            </Link>
          ) : (
            <button
              onClick={handleImport}
              className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-foreground/76 transition hover:border-white/18 hover:bg-white/[0.06]"
            >
              Import file
            </button>
          )}
          <button
            onClick={exportVisible}
            className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-foreground/76 transition hover:border-white/18 hover:bg-white/[0.06]"
          >
            Export visible
          </button>
          {newProductHref ? (
            <Link
              href={newProductHref}
              className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-background shadow-[0_16px_32px_rgba(255,255,255,0.12)] transition hover:opacity-95"
            >
              {newProductLabel}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        {/* {isSourceReadonly && sourceNotice ? (
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-foreground/72">
            {sourceNotice}
          </div>
        ) : null} */}

      <div className="flex flex-wrap items-center gap-3">

  <label className="premium-search flex min-w-[250px] flex-1 items-center gap-3 rounded-[22px] px-4 py-3">
    <Search className="h-4 w-4 text-foreground/45" />
    <input
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder="Search by product, base SKU, variant SKU, brand, category, or attribute value"
      className="w-full border-none bg-transparent p-0 text-sm text-foreground outline-none placeholder:text-foreground/26"
    />
  </label>

  <div className="flex items-center gap-1 rounded-[22px] border border-white/8 bg-white/[0.03] p-1.5 shadow-[0_16px_30px_rgba(0,0,0,0.16)]">
    <button
      onClick={() => setViewMode("product")}
      className={`flex items-center gap-2 rounded-[18px] px-4 py-2 text-sm font-semibold ${
        viewMode === "product"
          ? "text-blue-600 shadow-[0_8px_20px_rgba(255,255,255,0.12)]"
          : "text-foreground/55 hover:bg-white/[0.04]"
      }`}
    >
      <LayoutGrid className="h-4 w-4" />
      Group view
    </button>

    <button
      onClick={() => setViewMode("sku")}
      className={`flex items-center gap-2 rounded-[18px] px-4 py-2 text-sm font-semibold ${
        viewMode === "sku"
          ? "text-blue-600 shadow-[0_8px_20px_rgba(255,255,255,0.12)]"
          : "text-foreground/55 hover:bg-white/[0.04]"
      }`}
    >
      <Layers className="h-4 w-4" />
      SKU view
    </button>
  </div>

  <button
    onClick={() => setFilterPanelOpen((c: boolean) => !c)}
    className="inline-flex items-center gap-2 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-foreground/80 transition hover:border-white/18 hover:bg-white/[0.06]"
  >
    <SlidersHorizontal className="h-4 w-4" />
    Filters
  </button>

  <label className="inline-flex items-center gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-foreground/80">
    <ArrowDownUp className="h-4 w-4" />
    <select
      value={sortBy}
      onChange={(event) => setSortBy(event.target.value)}
      className="border-none text-sm text-foreground outline-none "
      style={{colorScheme: "dark"}}
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value} className=" text-white">
          {option.label}
        </option>
      ))}
    </select>
  </label>

  <label className="inline-flex items-center gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-foreground/80">
    <ChevronsUpDown className="h-4 w-4" />
    <select
      value={pageSize}
      onChange={(event) => setPageSize(Number(event.target.value))}
      className="border-none text-sm text-foreground outline-none"
    
    >
      {PAGE_SIZE_OPTIONS.map((value) => (
        <option key={value} value={value} className="text-white">
          {value} / page
        </option>
      ))}
    </select>
  </label>

</div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SummaryTile label="Visible products" value={String(visibleCount)} tone="neutral" />
          <SummaryTile label="Available stock" value={String(availableStock)} tone="primary" />
          <SummaryTile label="Selected rows" value={String(selectedIdsCount)} tone="neutral" />
          <SummaryTile label="Active filters" value={String(activeFilterCount)} tone="neutral" />
        </div>

        {filterPanelOpen ? (
          <motion.div
            initial={{opacity: 0, y: -8}}
            animate={{opacity: 1, y: 0}}
            className="grid-row gap-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
          >
            {/* <FilterGroup
              title="Brand"
              values={brandOptions}
              selectedValues={brandFilters}
              onToggle={(value) => setBrandFilters((current) => toggleValue(current, value))}
            />
            <FilterGroup
              title="Status"
              values={statusOptions}
              selectedValues={statusFilters}
              onToggle={(value) => setStatusFilters((current) => toggleValue(current, value))}
            />
            <FilterGroup
              title="Product type"
              values={productTypeOptions}
              selectedValues={typeFilters}
              onToggle={(value) => setTypeFilters((current) => toggleValue(current, value))}
            /> */}

            <FilterGroup
              title="Category"
              values={categoryOptions}
              selectedValues={categoryFilters}
              onToggle={(value) => setCategoryFilters((current) => toggleValue(current, value))}
            />

            <div className="xl:col-span-4 mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Attribute filters</h3>
                  <p className="text-xs text-foreground/52">
                    Filter products by specific attributes like size, color, or material.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-[color:var(--surface)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/64">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(event) => setAvailableOnly(event.target.checked)}
                    className="h-4 w-4 rounded border-white/30 bg-transparent"
                  />
                  Available stock only
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                {attributeCatalog.map((attribute) => (
                  <FilterGroup
                    key={attribute.key}
                    title={attribute.label}
                    values={attribute.values}
                    selectedValues={attributeFilters[attribute.key] ?? []}
                    onToggle={(value) =>
                      setAttributeFilters((current) => ({
                        ...current,
                        [attribute.key]: toggleValue(current[attribute.key] ?? [], value),
                      }))
                    }
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
          <ShowAppliedfilter
          appliedFilters={appliedFilters}
          clearAllFilters={clearAllFilters}
          />
        {/* {appliedFilters.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {appliedFilters.map((filterItem) => (
              <button
                key={filterItem.key}
                onClick={filterItem.onRemove}
                className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-foreground/72"
              >
                {filterItem.label}
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-foreground"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Clear all
            </button>
          </div>
        ) : null} */}
      </div>
    </section>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "neutral" | "primary";
}) {
  return (
    <div
      className={`rounded-[22px] border px-4 py-4 ${
        tone === "primary"
          ? "border-white/12 bg-white/[0.05]"
          : "border-white/8 bg-white/[0.03]"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function FilterGroup({
  title,
  values,
  selectedValues,
  onToggle,
}: {
  title: string;
  values: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}) {
  const chipsRef = React.useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = React.useState(false);
  const [hasOverflow, setHasOverflow] = React.useState(false);
  const [collapsedMaxHeight, setCollapsedMaxHeight] = React.useState(40);
  const selectedValuesKey = React.useMemo(() => selectedValues.join("\u0000"), [selectedValues]);

  const recompute = React.useCallback(() => {
    const el = chipsRef.current;
    if (!el) return;

    const firstChip = el.querySelector<HTMLElement>("button");
    const firstChipHeight = firstChip ? Math.ceil(firstChip.getBoundingClientRect().height) : 40;
    const nextCollapsedMaxHeight = Math.max(32, firstChipHeight);
    setCollapsedMaxHeight(nextCollapsedMaxHeight);

    const overflow = el.scrollHeight > nextCollapsedMaxHeight + 1;
    setHasOverflow(overflow);
    if (!overflow) {
      setExpanded(false);
    }
  }, []);

  React.useEffect(() => {
    const raf = requestAnimationFrame(recompute);
    return () => cancelAnimationFrame(raf);
  }, [recompute, values.length, selectedValuesKey]);

  React.useEffect(() => {
    const el = chipsRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => recompute());
    ro.observe(el);
    return () => ro.disconnect();
  }, [recompute]);

  if (!values.length) {
    return null;
  }

  return (
    <div className="rounded-[22px] border border-white/8 bg-[color:var(--surface)] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
          {title}
        </p>
        {hasOverflow ? (
          <button
            type="button"
            onClick={() => setExpanded((curr) => !curr)}
            aria-expanded={expanded}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/70 transition hover:border-white/18 hover:bg-white/[0.05] hover:text-foreground"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        ) : null}
      </div>

      <div
        ref={chipsRef}
        className={`flex flex-wrap gap-2 ${expanded ? "" : "overflow-hidden"}`}
        style={expanded ? undefined : { maxHeight: collapsedMaxHeight }}
      >
        {values.map((value) => {
          const selected = selectedValues.includes(value);

          return (
            <button
              key={value}
              onClick={() => onToggle(value)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                selected
                  ? "border-white/14 bg-white/[0.08]"
                  : "border-white/8 bg-white/[0.03] text-foreground/66 hover:text-foreground"
              }`}
            >
              {selected ? <Check className="h-3.5 w-3.5" /> : null}
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
