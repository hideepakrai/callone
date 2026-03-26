import React from 'react'
import GetAllProducts from '../GetAllProducts'
import UpdateBrandAttribute from '../UpdateBrandAttribute'
import GetAllBrands from '@/components/brands/GetAllBrands'
import GetAllAtributeSet from '@/components/attributeSet/GetAllAtributeSet'

const OgioHome = () => {


    return (
        <>  <GetAllProducts />
            <UpdateBrandAttribute />
            <GetAllBrands />
            <GetAllAtributeSet />
        </>
    )
}

export default OgioHome