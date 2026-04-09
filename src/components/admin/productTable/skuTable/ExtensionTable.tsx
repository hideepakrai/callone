'use client';

import React, { useMemo } from "react";
import { SkuQuantityInput } from "./SkuQuantityInput";

interface ExtensionTableProps {
  parentRow: any;
  variationSkus: string[] | string;
  allData: any[];
  items: any[];
}

export function ExtensionTable({
  parentRow,
  variationSkus,
  allData,
  items
}: ExtensionTableProps) {
  const variationRows = useMemo(() => {
    const skus = Array.isArray(variationSkus)
      ? variationSkus
      : (typeof variationSkus === 'string' ? variationSkus.split(',').map(s => s.trim()) : []);

    // Filter allData to find rows whose SKU is in the variation list
    return allData.filter(row => skus.includes(row.sku));
  }, [variationSkus, allData]);

  if (variationRows.length === 0) return null;

  return (
    <table className="min-w-full text-left text-sm">
      <thead>
        <tr className="bg-[#111111] text-white">
          <th className="px-4 py-2 w-10">
            <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-transparent" />
          </th>
          <th className="px-4 py-2 font-semibold uppercase tracking-wider text-[11px]">SKU</th>
          <th className="px-4 py-2 font-semibold uppercase tracking-wider text-[11px]">Style</th>
          <th className="px-4 py-2 font-semibold uppercase tracking-wider text-[11px]">Size</th>
          <th className="px-4 py-2 font-semibold uppercase tracking-wider text-[11px]">Qty90</th>
          <th className="px-4 py-2 font-semibold uppercase tracking-wider text-[11px]">Qty88</th>
          <th className="px-4 py-2 font-semibold uppercase tracking-wider text-[11px]">Qty</th>
          <th className="px-4 py-2 font-semibold uppercase tracking-wider text-[11px]">MRP</th>
          <th className="px-4 py-2 font-semibold uppercase tracking-wider text-[11px]">Amount</th>
        </tr>
      </thead>
      <tbody>
        {variationRows.map((vRow: any) => {
          const cartItem = items.find(item => item.sku === vRow.sku);
          const totalQty = (cartItem?.qty88 || 0) + (cartItem?.qty90 || 0);

          return (
            <tr key={vRow.sku} className="border-b border-border/40 hover:bg-primary/5 transition-colors">
              <td className="px-4 py-3">
                <input type="checkbox" className="h-4 w-4 rounded border-border/80" />
              </td>
              <td className="px-4 py-3 font-medium text-foreground">{vRow.sku}</td>
              <td className="px-4 py-3 text-foreground/70">{vRow.style_id || vRow.baseSku || "-"}</td>
              <td className="px-4 py-3 text-foreground/70">{vRow.size || "-"}</td>
              <td className="px-4 py-2">
                <div className="w-24">
                  <SkuQuantityInput
                    row={vRow}
                    qty={"qty90"} 
                    value={cartItem?.qty90 || 0}
                    maxStock={Number(vRow.stock_90) || 0}
                  />
                </div>
              </td>
              <td className="px-4 py-2">
                <div className="w-24">
                  <SkuQuantityInput
                    row={vRow}
                    qty={"qty88"}
                    value={cartItem?.qty88 || 0}
                    maxStock={Number(vRow.stock_88) || 0}
                  />
                </div>
              </td>
           
              <td className="px-4 py-3">
                <span className="font-semibold text-foreground">{totalQty}</span>
              </td>
              <td className="px-4 py-3 text-foreground/70">{vRow.mrp || "-"}</td>
              <td className="px-4 py-3 text-foreground/70 font-medium">{vRow.amount || 0}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
