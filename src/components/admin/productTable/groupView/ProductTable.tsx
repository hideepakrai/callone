'use client';

import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Package2, Pencil, Trash2, ShoppingCart } from "lucide-react";
import { ProductImage } from "../../ProductImage";

interface ProductTableProps {
  visibleRows: any[];
  selectedIds: string[];
  setSelectedIds: (fn: (curr: string[]) => string[]) => void;
  allVisibleSelected: boolean;
  isSourceReadonly: boolean;
  handleDelete: (id: string) => void;
  deletingId: string;
  statusClasses: (status: string) => string;
  onOpenPreview: (images: string[], index: number) => void;
}

export function ProductTable({
  visibleRows,
  selectedIds,
  setSelectedIds,
  allVisibleSelected,
  isSourceReadonly,
  handleDelete,
  deletingId,
  statusClasses,
  onOpenPreview,
}: ProductTableProps) {
  const { items } = useSelector((state: RootState) => state.cart);


  return (
    <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
      <thead>
        <tr className="bg-background text-foreground">
          <StickyHeading className="w-12 px-4 py-3">
            <input
              type="checkbox"
              aria-label="Select visible products"
              checked={allVisibleSelected}
              onChange={() => {
                if (allVisibleSelected) {
                  setSelectedIds((current) =>
                    current.filter((id) => !visibleRows.some((row) => row.rowKey === id))
                  );
                } else {
                  setSelectedIds((current) =>
                    Array.from(new Set([...current, ...visibleRows.map((row) => row.rowKey)]))
                  );
                }
              }}
              className="h-4 w-4 rounded border-border/20 bg-transparent"
            />
          </StickyHeading>
          <StickyHeading className="min-w-[320px] px-4 py-3">Product</StickyHeading>
          <StickyHeading className="min-w-[150px] px-4 py-3">Brand</StickyHeading>
          <StickyHeading className="min-w-[180px] px-4 py-3">Category</StickyHeading>
          <StickyHeading className="min-w-[260px] px-4 py-3">Attributes</StickyHeading>
          <StickyHeading className="min-w-[180px] px-4 py-3">Variants</StickyHeading>
          <StickyHeading className="min-w-[140px] px-4 py-3">Stock</StickyHeading>
          <StickyHeading className="min-w-[140px] px-4 py-3">Selected</StickyHeading>
          <StickyHeading className="min-w-[130px] px-4 py-3">Status</StickyHeading>
          <StickyHeading className="min-w-[120px] px-4 py-3">Actions</StickyHeading>
        </tr>
      </thead>
      <tbody className="bg-[color:var(--surface)]">
        {visibleRows.length ? (
          visibleRows.map((row) => {
            const isSelected = selectedIds.includes(row.rowKey);
            return (
              <tr key={row.rowKey} className="border-b border-border/60 transition-colors hover:bg-card/[0.04]">
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  <input
                    type="checkbox"
                    aria-label={`Select ${row.name}`}
                    checked={isSelected}
                    onChange={() =>
                      setSelectedIds((current) =>
                        current.includes(row.rowKey)
                          ? current.filter((id) => id !== row.rowKey)
                          : [...current, row.rowKey]
                      )
                    }
                    className="mt-1 h-4 w-4 rounded border-border/80"
                  />
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  <div className="flex gap-3">
                    <ProductImage
                      brandName={row.brand.name}
                      rowData={row}
                      alt={row.name}
                      className="h-11 w-11 shrink-0"
                      onClick={() => {
                        const s3_url = `https://callaways3bucketcc001-prod.s3.ap-south-1.amazonaws.com/public/productimg/TRAVIS-Images`;
                        const s3_url_ogio = `https://callaways3bucketcc001-prod.s3.ap-south-1.amazonaws.com/public/productimg/OGIO-Images`;
                        const skuValue = row.sku || row.baseSku;

                        const resolveUrl = (url: string) => {
                          if (!url) return '';
                          if (url.startsWith('http') || url.startsWith('/')) return url;

                          if (row.brand.name === "Travis Mathew") {
                            // In Group View, baseSku is the family identifier
                            const fam = row.sku ? skuValue?.replace(/_[^_]*$/, '') : skuValue;
                            return `${s3_url}/${fam}/${url}`;
                          } else if (row.brand.name === "Ogio") {
                            return `${s3_url_ogio}/${skuValue}/${url}`;
                          }
                          return url.startsWith('/') ? url : `/${url}`;
                        };

                        const primary = resolveUrl(row.primary_url || row.primary_image_url);
                        const gallery = row.gallery_images_url
                          ? row.gallery_images_url.split(',').map((url: string) => resolveUrl(url.trim()))
                          : [];

                        onOpenPreview([primary, ...gallery].filter(Boolean), 0);
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-foreground">{row.name}</p>
                        <span className="rounded-full border border-border/70 bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/48" title="Base/Family SKU">
                          {row.baseSku} (Base)
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-foreground/52">
                        {row.subcategory || "No subcategory"} · {row.productType}
                      </p>
                      <p className="mt-2 line-clamp-1 text-xs text-foreground/45">
                        {row.variantSkus.slice(0, 3).join(" · ")}
                        {row.variantSkus.length > 3 ? ` +${row.variantSkus.length - 3} more` : ""}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{row.brand.name}</p>
                    <p className="text-xs text-foreground/52">{row.brand.code}</p>
                  </div>
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  <p className="font-medium text-foreground">{row.category || "Uncategorized"}</p>
                  <p className="mt-1 text-xs text-foreground/52">{row.subcategory || "No subcategory"}</p>
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  <div className="flex flex-wrap gap-2">
                    {row.attributeGroups.length ? (
                      row.attributeGroups.slice(0, 3).map((group: any) => (
                        <span
                          key={group.key}
                          className="rounded-2xl border border-border/70 bg-background px-2.5 py-1.5 text-xs text-foreground/66"
                        >
                          <span className="font-semibold text-foreground/74">{group.label}:</span>{" "}
                          {group.values.slice(0, 2).join(", ")}
                          {group.values.length > 2 ? ` +${group.values.length - 2}` : ""}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-foreground/45">No variant attributes</span>
                    )}
                  </div>
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  <p className="font-semibold text-foreground">{row.variantCount}</p>
                  <p className="mt-1 text-xs text-foreground/52">
                    {row.variants.slice(0, 2).map((variant: any) => variant.title).join(" · ")}
                    {row.variants.length > 2 ? ` +${row.variants.length - 2} more` : ""}
                  </p>
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{row.availableStock}</p>
                    <p className="text-xs text-foreground/52">
                      Total Inv
                    </p>
                  </div>
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  {(() => {
                    // Aggregate quantities for all variants of this product that are in the cart
                    const variantSkus = row.variants?.map((v: any) => v.sku) || [];
                    const rowItems = items.filter(item => variantSkus.includes(item.sku));
                    const totalSelected = rowItems.reduce((sum, item) => sum + (item.qty88 || 0) + (item.qty90 || 0), 0);
                    
                    if (totalSelected === 0) return <span className="text-xs text-foreground/20 italic">None</span>;
                    
                    return (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-blue-500">
                          <ShoppingCart className="h-3.5 w-3.5" />
                          <span className="font-bold">{totalSelected}</span>
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-semibold">
                          Across {rowItems.length} Variants
                        </p>
                      </div>
                    );
                  })()}
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top shadow-none">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusClasses(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top shadow-none">
                  <div className="flex items-center gap-1.5">
                    <div className="group relative">
                      <Link
                        href={`/admin/products/${row.id}/edit`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/10 bg-card/[0.04] text-foreground/80 transition-all hover:bg-card/[0.08] hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-background/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground opacity-0 transition-all group-hover:opacity-100">
                        Edit Product
                        <div className="absolute top-full left-1/2 h-1 w-1 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-black/80" />
                      </div>
                    </div>

                    <div className="group relative">
                      <button
                        onClick={() => handleDelete(row.id)}
                        disabled={deletingId === row.id}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/10 bg-card/[0.04] text-foreground/80 transition-all hover:bg-card/[0.08] hover:text-foreground disabled:opacity-50 disabled:hover:bg-card/[0.04] disabled:hover:text-foreground/80"
                      >
                        {deletingId === row.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-background/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground opacity-0 transition-all group-hover:opacity-100">
                        {deletingId === row.id ? "Deleting..." : "Delete Product"}
                        <div className="absolute top-full left-1/2 h-1 w-1 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-black/80" />
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={9} className="px-6 py-14 text-center">
              <div className="mx-auto flex max-w-md flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-card text-foreground">
                  <Package2 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">No products found</h3>
                <p className="mt-2 text-sm text-foreground/56">
                  Try adjusting your search terms or clearing active filters.
                </p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
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
      className={`bg-card text-foreground shadow-[0_1px_0_rgba(255,255,255,0.08)]  ${className || ""}`}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/82">
        {children}
      </div>
    </th>
  );
}

