"use client"
import React, { useEffect, useState } from 'react'
import { SectionCard } from '../admin/SectionCard'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { createWarehouse, updateWarehouse } from '@/store/slices/wareHouse/wareHouseThunk'
import { IBrand, IWarehouse } from '@/components/warehouse/WareHouseType'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
    onCancel: () => void
}
const WareHouseForm = ({ onCancel }: Props) => {
    const dispatch = useDispatch<AppDispatch>()
    const { isLoading } = useSelector((state: RootState) => state.warehouse)
    const { currentWareHouse } = useSelector((state: RootState) => state.warehouse)
    const [formValues, setFormValues] = useState<IWarehouse>({
        _id: "",
        name: "",
        code: "",
        location: "",
        priority: 10,
        isActive: true,
        brands: [],
        createdAt: "",
        updatedAt: "",
    });
    useEffect(() => {
        if (currentWareHouse?._id) {
            setFormValues({
                _id: currentWareHouse._id,
                name: currentWareHouse.name ?? "",
                code: currentWareHouse.code ?? "",
                location: currentWareHouse.location ?? "",
                priority: currentWareHouse.priority ?? 10,
                isActive: currentWareHouse.isActive ?? true,
                brands: currentWareHouse.brands ?? [],
                createdAt: currentWareHouse.createdAt,
                updatedAt: currentWareHouse.updatedAt,
            });

            setSelectedBrands(currentWareHouse.brands ?? []);
        }
    }, [currentWareHouse]);
    // Pulling available brands from your brand slice
    const { allBrand } = useSelector((state: RootState) => state.brand)

    // Local state to track selected brands
    const [selectedBrands, setSelectedBrands] = useState<IBrand[]>([])

    const handleToggleBrand = (brand: IBrand) => {
        setSelectedBrands(prev => {
            const isSelected = prev.find(b => b._id === brand._id)
            if (isSelected) {
                return prev.filter(b => b._id !== brand._id)
            } else {
                return [...prev, brand]
            }
        })
    }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    const payload = {
      code: formValues.code,
      name: formValues.name,
      location: formValues.location,
      priority: Number(formValues.priority),
      isActive: formValues.isActive,
      brands: selectedBrands, // or formValues.brands (see note below)
    };

    if (currentWareHouse?._id) {
      // 🔥 UPDATE
     const response= await dispatch(
        updateWarehouse({
          id: currentWareHouse._id,
          data: payload,
        })
      ).unwrap();
      console.log("response", response);
      if(response.success){
        toast.success("Warehouse updated successfully");
      }
    } else {
      // 🔥 CREATE
      const response = await dispatch(createWarehouse(payload)).unwrap();
      console.log("response", response);
      if(response.success){
        toast.success("Warehouse created successfully");
      }
    }

    onCancel(); // close form after success
  } catch (error) {
    console.error("Submit error:", error);
  }
};

    return (
        <SectionCard title="Create Warehouse">
            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
                {/* Basic Fields */}
                <div className="space-y-4">
                    <label className="block">
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-foreground/45">Name</span>
                        <input
                            value={formValues.name}
                            onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                            name="name" placeholder="Primary Warehouse" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" required />
                    </label>
                    <label className="block">
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-foreground/45">Code</span>
                        <input 
                        value={formValues.code}
                        onChange={(e) => setFormValues({ ...formValues, code: e.target.value })}
                        name="code" placeholder="WH88" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" required />
                    </label>

                </div>

                <div className="space-y-4">
                    <label className="block">
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-foreground/45">Location</span>
                        <input 
                        value={formValues.location}
                        onChange={(e) => setFormValues({ ...formValues, location: e.target.value })}
                        name="location" placeholder="City, State"
                            className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
                    </label>
                    <label className="block">
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-foreground/45"
                        >Priority</span>
                        <input 
                        value={formValues.priority}
                        onChange={(e) => setFormValues({ ...formValues, priority: Number(e.target.value) })}
                        name="priority" type="number" defaultValue="10" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
                    </label>
                </div>

                {/* Brand Assignment Section */}
                <div className="lg:col-span-2">
                    <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-foreground/45">Assign Brands</span>
                    <div className="flex flex-wrap gap-2 rounded-2xl border border-border/50 bg-card/30 p-4">
                        {allBrand?.map((brand: IBrand) => {
                            const isSelected = selectedBrands.some(b => b._id === brand._id);
                            return (
                                <button
                                    key={brand._id}
                                    type="button"
                                    onClick={() => handleToggleBrand(brand)}
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${isSelected
                                        ? "bg-primary text-white"
                                        : "bg-background border border-border/60 text-foreground/60 hover:border-primary/40"
                                        }`}
                                >
                                    {brand.name}
                                    {isSelected && <Check className="h-3.5 w-3.5" />}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Boolean Flags */}
                <div className="flex items-center gap-6 lg:col-span-2">
                    {/* <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground/70 cursor-pointer">
                        <input type="checkbox" name="isDefault" className="h-4 w-4 rounded border-border/70 accent-primary" />
                        Default warehouse
                    </label> */}
                    <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground/70 cursor-pointer">
                        <input 
                        checked={formValues.isActive}
                        onChange={(e) => setFormValues({ ...formValues, isActive: e.target.checked })}
                        type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded border-border/70 accent-primary" />
                        Active
                    </label>
                </div>

                <div className="lg:col-span-2 flex justify-end pt-4">
                 { currentWareHouse==null && <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-2xl px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isLoading ? "Saving..." : "Save Warehouse"}
                    </button>}
                   { currentWareHouse!=null && <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-2xl px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isLoading ? "Saving..." : "Update Warehouse"}
                    </button>}
                    <button
                        type="button"
                        onClick={() => onCancel}
                        className="flex items-center gap-2 rounded-2xl px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </SectionCard>
    )
}

export default WareHouseForm