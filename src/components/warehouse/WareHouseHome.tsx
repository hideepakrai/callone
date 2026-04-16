"use client"
import React, { useState } from 'react'
import { PageHeader } from '../admin/PageHeader'
import WareHouseForm from './WareHouseForm'
import WareHousetable from './WareHousetable'
import GetAllWareHouse from './GetAllWareHouse'


type props={
    warehouses:any[]
    inventorySummary:Map<string, {skuCount: number; onHand: number; reserved: number; available: number}>
}
const WareHouseHome = ({warehouses,inventorySummary}:props) => {

    const [isOpen,setIsOpen] = useState<boolean>(false)

    const handdleAddWareHouse=()=>{
        setIsOpen(true)
    }
  return (
    <>
    <GetAllWareHouse/>
    <PageHeader
        title="Warehouses"
        description="Replace fixed stock columns with reusable warehouse records and live stock reservations."
        
      />
     
      {isOpen && <WareHouseForm
      onCancel={() => setIsOpen(false)}
      />}
 <button
          onClick={handdleAddWareHouse}
            className="rounded-2xl border border-border/70 bg-background px-5 py-3 text-sm font-semibold text-foreground/75"
          >
           Add Warehouse
          </button>
      <WareHousetable
    //   warehouses={warehouses}
    //   inventorySummary={inventorySummary}
      />
    </>
  )
}

export default WareHouseHome