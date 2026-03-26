"use client"
import { AppDispatch, RootState } from '@/store'
import { fetchBrands } from '@/store/slices/brandSlice/brandThunks'
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const GetAllBrands = () => {

  const isApi= useRef<Boolean>(false)
    const dispatch=useDispatch<AppDispatch>()
  const {isFetchedBrand}= useSelector((state:RootState)=>state.brand)

  useEffect(()=>{
    if(!isFetchedBrand && !isApi.current){
      isApi.current=true
      dispatch(fetchBrands())
    }else{
        isApi.current=false
    }
  },[isFetchedBrand])

    
  return (
  null
  )
}

export default GetAllBrands