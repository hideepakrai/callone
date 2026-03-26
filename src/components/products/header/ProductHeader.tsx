"use client"
import { Link } from 'lucide-react';
import React from 'react'


type props={
    title:string;
    description:string;
    totalCount:number;
    onImport:()=>void;
    onExportVisible:()=>void;
}
const ProductHeader = ({title,description,totalCount,onImport,onExportVisible}:props) => {
  return (
   <div className="grid gap-3 border-b border-border/60 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/42">
          PRODUCTS
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <h2 className="text-[1.85rem] font-semibold tracking-tight text-foreground">
        {title}
          </h2>
          <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">
            {totalCount} TOTAL
          </span>
        </div>
        <p className="max-w-4xl text-sm text-foreground/62">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onImport}
          className="rounded-2xl border border-border/70 bg-transparent px-4 py-2.5 text-sm font-semibold text-foreground/76 transition-colors hover:bg-white/5"
        >
          Import file
        </button>
        <button
          onClick={onExportVisible}
          className="rounded-2xl border border-border/70 bg-transparent px-4 py-2.5 text-sm font-semibold text-foreground/76 transition-colors hover:bg-white/5"
        >
          Export visible
        </button>
        <Link
          href="/admin/products/new"
          className="rounded-2xl bg-[#4b8df8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3b7de8]"
        >
          New product
        </Link>
      </div>
    </div>
  )
}

export default ProductHeader