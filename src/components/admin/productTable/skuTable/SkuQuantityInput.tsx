'use client';

import { calculateValues } from "@/components/order/util/OrderUtil";
import { AppDispatch, RootState } from "@/store";
import { addToCart, CartItem } from "@/store/slices/cart/cartSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";

interface SkuQuantityInputProps {
  row: any;
  value: number;
  maxStock: number;
  qty: string;
  // onChange: (val: number) => void;
}

export function SkuQuantityInput({
  row,
  value,
  maxStock,
  qty,
  // onChange,
}: SkuQuantityInputProps) {
  const isError = value > maxStock || value < 0;
  const [inputvalue, setInputValue] = useState(value);

  const { currentBrand } = useSelector((state: RootState) => state.brand);
  
  // Sync from prop if Redux updates
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const dispatch = useDispatch<AppDispatch>();

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    handleChange(val);
  };

  const handleChange = React.useCallback(
    (val: number) => {
      const clampedVal = Math.max(0, Math.min(val, maxStock));
      setInputValue(clampedVal); // Immediate local update

      const data: CartItem = {
        sku: row.sku,
        brand: currentBrand?.name,
        description: row.description,
        image: row.primary_image_url,
        [qty]: clampedVal,
        mrp: Number(row.mrp) || 0,
        gst: Number(row.gst) || 0,
        amount: Number(row.mrp) || 0,
        discount: 0,
        lessDiscount: 0,
        netBilling: 0,
        finalAmount: 0,
        isIndividualDiscount:false
      };
      const updateData = calculateValues(data, 22, "inclusive");
      // console.log("updateData---->",updateData)
      dispatch(addToCart(updateData));
    },
    [maxStock, row, currentBrand, qty, dispatch]
  );

  // Sync from maxStock if needed
  useEffect(() => {
    if (inputvalue > maxStock) {
      handleChange(maxStock);
    }
  }, [maxStock, inputvalue, handleChange]);


  //add the project into the DB

  return (
    <div
      className={clsx(
        "inline-flex items-stretch overflow-hidden rounded-xl border transition-all duration-300",
        isError
          ? "border-border/14 bg-card ring-1 ring-border/10 shadow-[0_0_15px_rgba(255,255,255,0.06)]"
          : "border-border/10 bg-card hover:border-border/18 "
      )}
      style={{ height: "40px" }}
    >
      {/* Stock Display (Left indicator) */}
      <div
        className={clsx(
          "flex items-center justify-center px-3 text-[9px] font-black uppercase tracking-widest transition-colors",
          isError ? "bg-card/[0.06] text-foreground" : "border-r border-border/10 bg-card/[0.03] text-foreground/72"
        )}
        style={{ minWidth: "38px" }}
        title="Physical Inventory Limit"
      >
        {maxStock}
      </div>

      {/* Input Field */}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputvalue}
        onChange={handleManualChange}
        className={clsx(
          "w-12 bg-transparent px-1 text-center text-sm font-black tracking-tighter focus:outline-none transition-colors",
          isError ? "text-foreground" : "text-foreground"
        )}
      />

      {/* Stepper Controls */}
      <div className="flex flex-col border-l border-border/10">
        <button
          disabled={inputvalue >= maxStock}
          onClick={() => handleChange(inputvalue + 1)}
          className="flex flex-1 items-center justify-center border-b border-border/10 px-2 text-[8px] text-foreground/72 transition-all active:scale-95 hover:bg-card/[0.06] disabled:cursor-not-allowed disabled:opacity-20"
          aria-label="Increase level"
        >
          <span className="mb-0.5">▲</span>
        </button>
        <button
          disabled={inputvalue <= 0}
          onClick={() => handleChange(Math.max(0, inputvalue - 1))}
          className="flex flex-1 items-center justify-center px-2 text-[8px] text-foreground/72 transition-all active:scale-95 hover:bg-card/[0.06] disabled:cursor-not-allowed disabled:opacity-20"
          aria-label="Decrease level"
        >
          <span className="mt-0.5">▼</span>
        </button>
      </div>
    </div>
  );
}

