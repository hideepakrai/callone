
"use client";

import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { OrderRow } from "./OrderRow";
import { Search, Filter, ChevronRight, ChevronLeft, Users as UsersIcon, CheckCircle2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "pending" | "completed" | "users";

export const OrderList = () => {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  const { allOrders, isLoadingOrders } = useSelector((state: RootState) => state.order);
  const { allRetailer, allManager } = useSelector((state: RootState) => state.user);

  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const statusMatch = activeTab === "pending" 
        ? order.status !== "complete-order" 
        : activeTab === "completed" 
          ? order.status === "complete-order"
          : true; // "users" tab might have different logic or just show all

      const query = searchQuery.toLowerCase();
      const searchMatch = !query || 
        (order.id?.toString().includes(query)) ||
        (order.orderNumber?.toLowerCase().includes(query)) ||
        (order.retailer_id?.toLowerCase().includes(query));

      return statusMatch && searchMatch;
    });
  }, [allOrders, activeTab, searchQuery]);

  // Pagination logic
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  const tabs = [
    { id: "pending", label: "Pending Orders", icon: Clock },
    { id: "completed", label: "Completed Orders", icon: CheckCircle2 },
    { id: "users", label: "Users", icon: UsersIcon },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`group relative flex items-center gap-3 rounded-xl px-6 py-3.5 transition-all active:scale-[0.98] ${
                isActive 
                  ? "bg-black text-white shadow-[0_10px_25px_rgba(0,0,0,0.2)]" 
                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} className={isActive ? "text-primary" : "text-white/20 group-hover:text-white/40"} />
              <span className={`text-sm font-bold uppercase tracking-wider ${isActive ? "text-white" : ""}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl border border-white/10 ring-1 ring-white/5"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#111111] shadow-[0_45px_100px_rgba(0,0,0,0.4)]">
        {/* Header / Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-white/[0.02] px-8 py-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black uppercase tracking-widest text-white">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <div className="h-6 w-px bg-white/10" />
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              {totalItems} total items
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-primary" size={16} />
              <input
                type="text"
                placeholder="Search by ID or Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-64 rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm font-medium text-white outline-none transition-all focus:border-white/20 focus:bg-white/8 placeholder:text-white/20"
              />
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1.5 px-2">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === p 
                          ? "bg-primary text-white" 
                          : "text-white/40 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
              
              <select 
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="ml-2 h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-bold text-white/60 outline-none hover:bg-white/10 cursor-pointer"
              >
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="relative overflow-x-auto">
          {activeTab === "users" ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01]">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Name</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Role</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Email</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Phone</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...allRetailer, ...allManager].map((user) => (
                  <tr key={user._id || user.id} className="group hover:bg-white/[0.03] transition-all">
                    <td className="px-6 py-4 text-sm font-bold text-white/90">{user.name}</td>
                    <td className="px-6 py-4 lowercase">
                      <span className="inline-flex rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/50 first-letter:uppercase">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60">{user.email || "—"}</td>
                    <td className="px-6 py-4 text-sm text-white/60">{user.phone || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors">
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01]">
                  <th className="px-6 py-5"></th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Order Id</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Retailer Name</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Order Date</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Last Update</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Discount</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Amount</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Status</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoadingOrders ? (
                  <tr>
                    <td colSpan={9} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/20">Loading workspace orders...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <OrderRow 
                      key={order._id || order.id?.toString()} 
                      order={order} 
                      retailers={allRetailer}
                      managers={allManager}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Clock size={48} className="text-white/5" />
                        <p className="text-lg font-bold text-white/20">No orders found matching your criteria</p>
                        <p className="text-sm text-white/10">Try adjusting your filters or search query</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
