"use client"
import React, { useEffect } from 'react'
import { PageHeader } from '../admin/PageHeader'
import { useRouter } from 'next/navigation'
import WareHouseForm from './WareHouseForm'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { setCurrentWarehouse } from '@/store/slices/wareHouse/wareHouseSlice'
import { IWarehouse } from './WareHouseType'


type Props = {warehouse:IWarehouse}
const EditWareHouse = ({warehouse}: Props) => {
    const router = useRouter()
    const dispatch= useDispatch()
    const { currentWareHouse } = useSelector((state: RootState) => state.warehouse);
       useEffect(() => {
        if(warehouse && currentWareHouse==null){
            dispatch(setCurrentWarehouse(warehouse))
        }
       },[warehouse, currentWareHouse])
  
    const handleCancel = () => {
        dispatch(setCurrentWarehouse(null))
        router.push('/admin/warehouses')
    }   
    
  return (
   <>
         <PageHeader title={`Edit ${currentWareHouse?.name}`} description="Update warehouse routing metadata and active/default flags." backHref="/admin/warehouses" />
    
    <WareHouseForm
   
    onCancel={() => handleCancel()}
    />  
   </>
  )
}

export default EditWareHouse