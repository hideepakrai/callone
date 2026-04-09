import React from 'react';
import { Edit2, Check, User, ShieldCheck, Briefcase, ShoppingBag } from 'lucide-react';
import { UserInterface } from '@/store/slices/users/userSlice';
import clsx from 'clsx';
import { PremiumSelect, SelectOption } from '@/components/ui/PremiumSelect';
import { motion, AnimatePresence } from 'framer-motion';

interface CartHeaderProps {
  selectedRetailer: UserInterface | null;
  selectedManager: UserInterface | null;
  selectedSalesRep: UserInterface | null;
  allRetailer: UserInterface[];
  allManager: UserInterface[];
  allSaleRep: UserInterface[];
  isEditingRetailer: boolean;
  setIsEditingRetailer: (val: boolean) => void;
  isEditingManager: boolean;
  setIsEditingManager: (val: boolean) => void;
  isEditingSalesRep: boolean;
  setIsEditingSalesRep: (val: boolean) => void;
  onUpdateRetailer: (id: string) => void;
  onUpdateManager: (id: string) => void;
  onUpdateSalesRep: (id: string) => void;
  setSelectedRetailer: (val: UserInterface | null) => void;
  setSelectedManager: (val: UserInterface | null) => void;
  setSelectedSalesRep: (val: UserInterface | null) => void;
}

export const CartHeader: React.FC<CartHeaderProps> = ({
  selectedRetailer,
  selectedManager,
  selectedSalesRep,
  allRetailer,
  allManager,
  allSaleRep,
  isEditingRetailer,
  setIsEditingRetailer,
  isEditingManager,
  setIsEditingManager,
  isEditingSalesRep,
  setIsEditingSalesRep,
  onUpdateRetailer,
  onUpdateManager,
  onUpdateSalesRep,
  setSelectedRetailer,
  setSelectedManager,
  setSelectedSalesRep,
}) => {
  const retailerOptions: SelectOption[] = allRetailer.map(r => ({
    value: r._id || "",
    label: r.name || "Unnamed Retailer",
    subLabel: r.address || "No address provided"
  }));

  const managerOptions: SelectOption[] = allManager.map(m => ({
    value: m._id || "",
    label: m.name || "Unnamed Manager",
    subLabel: "Administrative Lead"
  }));

  const salesRepOptions: SelectOption[] = [
    { value: "self", label: "Internal - Self", subLabel: "Active Account Lead" },
    ...allSaleRep.map(s => ({
      value: s._id || "",
      label: s.name || "Unnamed Representative",
      subLabel: "Active Account Lead"
    }))
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Retailer Section */}
      <div className={clsx(
        "group relative z-10 rounded-[24px] border border-border/40 bg-white/40 p-8 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:bg-white/60 focus-within:z-50",
        selectedRetailer ? "border-primary/20" : "border-border/30"
      )}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-500",
              selectedRetailer ? "bg-primary text-white" : "bg-foreground/5 text-foreground/30"
            )}>
              <ShoppingBag size={14} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20">Authorized Account</span>
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/60">Retailer</span>
            </div>
          </div>
          {selectedRetailer && !isEditingRetailer && (
            <button
              onClick={() => setIsEditingRetailer(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 text-foreground/30 transition-all hover:bg-primary hover:text-white"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>

        {!selectedRetailer || isEditingRetailer ? (
          <div className="space-y-4">
            <PremiumSelect
              options={retailerOptions}
              value={selectedRetailer?._id || ""}
              placeholder="Select Retailer Warehouse"
              searchable
              onChange={(val) => {
                const retailer = allRetailer.find(r => r._id === val);
                setSelectedRetailer(retailer || null);
                setIsEditingRetailer(false);
                onUpdateRetailer(retailer?._id || "");
              }}
            />
            {!selectedRetailer && (
               <div className="flex items-center gap-2 rounded-lg bg-rose-500/5 px-3 py-2 text-rose-500/60">
                 <div className="h-1.5 w-1.5 rounded-full bg-rose-500/40" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Awaiting Verification</span>
               </div>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-black tracking-tight text-primary leading-tight">{selectedRetailer?.name}</h3>
            <div className="flex flex-wrap gap-2 pt-2">
              <div className="flex items-center gap-2 rounded-lg bg-[#111111]/[0.03] px-3 py-1.5">
                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-foreground/20 italic">GSTIN</span>
                <span className="text-[10px] font-black text-foreground/70">{selectedRetailer?.gstin || "VERIFIED"}</span>
                <Check size={10} className="text-emerald-500" strokeWidth={4} />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-[#111111]/[0.03] px-3 py-1.5">
                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-foreground/20 italic">NODE</span>
                <span className="text-[10px] font-black text-foreground/70 max-w-[120px] truncate">{selectedRetailer?.address || "Global HQ"}</span>
              </div>
            </div>
            
            {/* Structural accent */}
            <div className="absolute -bottom-1 -right-1 opacity-5">
               <ShoppingBag size={80} strokeWidth={1} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Manager Section */}
      <div className={clsx(
        "group relative z-10 rounded-[24px] border border-border/40 bg-white/40 p-8 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:bg-white/60 focus-within:z-50",
        selectedManager ? "border-foreground/20" : "border-border/30"
      )}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-500",
              selectedManager ? "bg-[#111111] text-white" : "bg-foreground/5 text-foreground/30"
            )}>
              <ShieldCheck size={14} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20">Operational Lead</span>
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/60">Manager</span>
            </div>
          </div>
          {selectedManager && !isEditingManager && (
            <button
              onClick={() => setIsEditingManager(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 text-foreground/30 transition-all hover:bg-[#111111] hover:text-white"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>

        {!selectedManager || isEditingManager ? (
          <PremiumSelect
            options={managerOptions}
            value={selectedManager?._id || ""}
            placeholder="Select Manager"
            searchable
            onChange={(val) => {
              const manager = allManager.find(m => m._id === val);
              setSelectedManager(manager || null);
              setIsEditingManager(false);
              onUpdateManager(manager?._id || "");
            }}
          />
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h3 className="text-2xl font-black tracking-tight text-foreground/80 leading-tight">{selectedManager?.name}</h3>
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
               <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">Active Administrative Access</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sales Rep Section */}
      <div className={clsx(
        "group relative z-10 rounded-[24px] border border-border/40 bg-white/40 p-8 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:bg-white/60 focus-within:z-50",
        selectedSalesRep ? "border-foreground/20" : "border-border/30"
      )}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-500",
              selectedSalesRep ? "bg-[#111111] text-white" : "bg-foreground/5 text-foreground/30"
            )}>
              <Briefcase size={14} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20">Account Director</span>
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/60">Representative</span>
            </div>
          </div>
          {selectedSalesRep && !isEditingSalesRep && (
            <button
              onClick={() => setIsEditingSalesRep(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 text-foreground/30 transition-all hover:bg-[#111111] hover:text-white"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>

        {!selectedSalesRep || isEditingSalesRep ? (
          <PremiumSelect
            options={salesRepOptions}
            value={selectedSalesRep?._id || (selectedSalesRep?.name === "Internal (Self)" ? "self" : "")}
            placeholder="Select Representative"
            searchable
            onChange={(val) => {
              if (val === "self") {
                setSelectedSalesRep({ name: "Internal (Self)" } as UserInterface);
              } else {
                const rep = allSaleRep.find(s => s._id === val);
                setSelectedSalesRep(rep || null);
              }
              setIsEditingSalesRep(false);
              onUpdateSalesRep(val === "self" ? "" : val);
            }}
          />
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h3 className="text-2xl font-black tracking-tight text-foreground/80 leading-tight">{selectedSalesRep?.name || "Internal (Self)"}</h3>
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(75,141,248,0.5)]" />
               <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">Verified Account Lead</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
