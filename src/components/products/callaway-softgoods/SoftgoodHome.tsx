"use client"
import React from 'react'
import GetAllProducts from '../GetAllProducts'
import UpdateBrandAttribute from '../UpdateBrandAttribute'
import GetAllBrands from '@/components/brands/GetAllBrands'
import GetAllAtributeSet from '@/components/attributeSet/GetAllAtributeSet'
import { SoftgoodCatalogWorkspace } from './SoftgoodCatalogWorkspace'


const SoftgoodHome = () => {
    return (
        <>
           <SoftgoodCatalogWorkspace
           products={[]}
           />
            <GetAllProducts />
            <UpdateBrandAttribute />
            <GetAllBrands />
            <GetAllAtributeSet />
        </>
    )
}

export default SoftgoodHome