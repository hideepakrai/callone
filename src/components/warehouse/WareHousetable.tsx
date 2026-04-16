"use client"
import React from 'react'
import { SectionCard } from '../admin/SectionCard';
import { DataTable } from '../admin/DataTable';
import Link from 'next/link'; // Use Next.js Link
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';

import { Loader2 } from 'lucide-react';
import { IWarehouse } from './WareHouseType';
import { deleteWarehouse } from '@/store/slices/wareHouse/wareHouseThunk';
import { toast } from 'sonner';
import { setCurrentWarehouse } from '@/store/slices/wareHouse/wareHouseSlice';
import { useRouter } from 'next/navigation';

const WareHousetable = () => {
    const { allWareHouse, isLoading } = useSelector((state: RootState) => state.warehouse);
    const dispatch = useDispatch<AppDispatch>();
   const router=useRouter()
    const handleToggleActive = (id: string, currentState: boolean) => {
        if (!id) return;
        // dispatch(updateWarehouse({ 
        //     id, 
        //     data: { isActive: !currentState } 
        // }));
    };
  const handleDelete = async (wHouse: IWarehouse) => {
    const warehouseId = wHouse._id?.toString() || "";
    if (!warehouseId) return;
   const responee= await dispatch(deleteWarehouse(warehouseId));
   if(responee.meta.requestStatus === "fulfilled") {
    toast.success("Warehouse deleted successfully");
   }
   else {
    toast.error("Failed to delete warehouse");
   }
  }

  const handleEdit=(warehouse:IWarehouse)=>{
        dispatch(setCurrentWarehouse(warehouse))
        router.push(`/admin/warehouses/${warehouse._id}/edit`)
  }
    return (
        <SectionCard title="Warehouse list">
            <DataTable headers={["Warehouse", "Code", "Brands", "Status", "Active", "Actions"]}>
                {isLoading && allWareHouse.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="py-10 text-center">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                        </td>
                    </tr>
                ) : (
                    allWareHouse.map((warehouse) => {
                        const warehouseId = warehouse._id?.toString() || "";

                        return (
                            <tr key={warehouseId} className="border-b border-border/40">
                                <td className="px-4 py-4">
                                    <div className="font-semibold text-foreground">{warehouse.name}</div>
                                    <p className="text-xs text-foreground/55">{warehouse.location || "No location set"}</p>
                                </td>
                                
                                <td className="px-4 py-4 text-sm text-foreground/70">
                                    {warehouse.code}
                                </td>

                                {/* Render Brands logic */}
                                <td className="px-4 py-4 text-sm">
                                    <div className="flex flex-wrap gap-1">
                                        {warehouse.brands && warehouse.brands.length > 0 ? (
                                            warehouse.brands.map((brand) => (
                                                <span 
                                                    key={brand._id} 
                                                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                                                        brand.isActive 
                                                        ? "bg-primary/10 text-primary" 
                                                        : "bg-muted text-foreground/40"
                                                    }`}
                                                >
                                                    {brand.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-foreground/30">—</span>
                                        )}
                                    </div>
                                </td>

                                <td className="px-4 py-4 text-sm">
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                        warehouse.isActive ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                                    }`}>
                                        {warehouse.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>

                                {/* Toggle Active Checkbox */}
                                <td className="px-4 py-4 text-sm">
                                    <input 
                                        type="checkbox"
                                        checked={!!warehouse.isActive}
                                        onChange={() => handleToggleActive(warehouseId, !!warehouse.isActive)}
                                        className="h-4 w-4 rounded border-border/30 bg-card/5 accent-primary cursor-pointer"
                                    />
                                </td>

                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <button 
                                        onClick={()=>handleEdit(warehouse)}
                                            // onClick={() => router.push(`/admin/warehouses/${warehouseId}/edit`)} 
                                            className="text-sm font-semibold text-primary hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if(confirm("Are you sure?")) 
                                                    handleDelete(warehouse)
                                            }}
                                            className="text-sm font-semibold text-red-500 hover:text-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                )}
            </DataTable>
        </SectionCard>
    )
}

export default WareHousetable;