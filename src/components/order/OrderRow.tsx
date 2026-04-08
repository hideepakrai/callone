
"use client";

import React, { useState } from "react";
import { OrderModel } from "@/store/slices/order/OrderType";
import { UserInterface } from "@/store/slices/users/userSlice";
import { OrderItemsTable } from "./OrderItemsTable";
import { Plus, Minus, Download, Edit3, Loader2, FileSpreadsheet, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentOrder } from "@/store/slices/order/OrderSlice";
import { setCartFromOrder } from "@/store/slices/cart/cartSlice";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import { downloadOrderExcel } from "@/lib/utils/excelDownloader";
import { downloadOrderPDF } from "@/lib/utils/pdfDownloader";

interface OrderRowProps {
  order: OrderModel;
  retailers: UserInterface[];
  managers: UserInterface[];
}

export const OrderRow = ({ order, retailers, managers }: OrderRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { allSaleRep } = useSelector((state: RootState) => state.user);
  const getRetailerName = (id?: string) => {
    if (!id) return "—";
    const retailer = retailers.find((r) => r._id === id || r.id?.toString() === id);
    return retailer?.name || "Unknown Retailer";
  };

  const formatDate = (dateStr?: string) => {
    const date = dateStr ? new Date(dateStr) : new Date();
    return {
      date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const created = formatDate(order.created_at);
  const updated = formatDate(order.updated_at);

  const handleOrderEdit = (order: OrderModel) => {
    console.log(order);
    dispatch(setCurrentOrder(order));
    
    const retailer = retailers.find(r => r._id === order.retailer_id || r.id?.toString() === order.retailer_id);
    const manager = managers.find(m => m._id === order.manager_id || m.id?.toString() === order.manager_id);
    const salesRep = allSaleRep.find(s => s._id === order.salesrep_id || s.id?.toString() === order.salesrep_id);

    dispatch(setCartFromOrder({
      items: order.items || [],
      selectedRetailer: retailer || null,
      selectedManager: manager || null,
      selectedSalesRep: salesRep || null,
      discountType: order.discount_type,
      discountValue: order.discount_percent,
      cartId: order._id || order.id?.toString()
    }));

    router.push(`/admin/cart/${order.orderNumber}`);
  }

  return (
    <>
      <tr className={`group transition-all hover:bg-white/[0.03] ${isExpanded ? "bg-white/[0.04]" : ""}`}>
        <td className="px-6 py-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-all ${
              isExpanded 
                ? "border-primary bg-primary/20 text-primary shadow-[0_0_12px_rgba(36,73,111,0.3)]" 
                : "border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white"
            }`}
          >
            {isExpanded ? <Minus size={14} /> : <Plus size={14} />}
          </button>
        </td>
        <td className="px-6 py-4 font-mono text-sm font-bold text-white/90">
          {order.id || order.orderNumber || "—"}
        </td>
        <td className="px-6 py-4 text-sm font-semibold text-white/80">
          {getRetailerName(order.retailer_id)}
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white/70">{created.date}</span>
            <span className="text-[10px] uppercase tracking-wider text-white/30">{created.time}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white/70">{updated.date}</span>
            <span className="text-[10px] uppercase tracking-wider text-white/30">{updated.time}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-rose-400">
             ₹{(order.discountAmount || (order as any).pricing?.discountAmount || 0).toLocaleString()}
          </span>
        </td>
        <td className="px-6 py-4 text-sm font-black text-white">
          ₹{(order.totalAmount || (order as any).pricing?.finalTotal || 0).toLocaleString()}
        </td>
        <td className="px-6 py-4">
          <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
            order.status === "completed" 
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}>
            {order.status || "pending"}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <div className="group relative flex items-center justify-center">
              <button 
                onClick={() => downloadOrderExcel(order, retailers, managers)}
                className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2 text-emerald-400/60 transition hover:border-emerald-500/40 hover:text-emerald-400"
              >
                <FileSpreadsheet size={14} />
              </button>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                <div className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  EXCEL
                  <div className="absolute top-[95%] left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-emerald-500"></div>
                </div>
              </div>
            </div>

            <div className="group relative flex items-center justify-center">
              <button 
                onClick={() => downloadOrderPDF(order, retailers, managers, allSaleRep)}
                className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2 text-rose-400/60 transition hover:border-rose-500/40 hover:text-rose-400"
              >
                <FileText size={14} />
              </button>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                <div className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  PDF
                  <div className="absolute top-[95%] left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-rose-400"></div>
                </div>
              </div>
            </div>

            <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/40 transition hover:border-white/20 hover:text-white">
              <Edit3 size={14} 
              onClick={() => handleOrderEdit(order)}
              />
            </button>
          </div>
        </td>
      </tr>
      
      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={9} className="bg-black/40 px-6 py-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="py-6 pr-6 pl-12">
                   <OrderItemsTable items={order.items || []} />
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
};
