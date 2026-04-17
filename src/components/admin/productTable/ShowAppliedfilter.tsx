"use client"
import { RefreshCcw, X } from 'lucide-react'
import React from 'react'

type props = {
    appliedFilters: any[]
     clearAllFilters: () => void;
}
const ShowAppliedfilter = ({ appliedFilters,clearAllFilters }: props) => {
    return (
        <div>
           
        {appliedFilters.length ? (
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
        ) : null}
        </div>
    )
}

export default ShowAppliedfilter