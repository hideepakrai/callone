import {notFound} from "next/navigation";

import dbConnect from "@/lib/db/connection";
import {Warehouse} from "@/lib/db/models/Warehouse";
import EditWareHouse from "@/components/warehouse/EditWareHouse";

export default async function EditWarehousePage({params}: {params: {id: string}}) {
  await dbConnect();
 
  const warehouse = await Warehouse.findById(params.id).lean();

  if (!warehouse) {
    notFound();
  }

  return (
    <div className="space-y-8">

     <EditWareHouse
     warehouse={warehouse}
     />
    </div>
  );
}
