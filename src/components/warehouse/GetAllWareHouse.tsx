"use client"
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllWarehouses } from '@/store/slices/wareHouse/wareHouseThunk'
import { AppDispatch, RootState } from '@/store'


const GetAllWareHouse = () => {
  const {allWareHouse,isFetchedWareHouse} = useSelector((state:RootState)=>state.warehouse)
    const dispatch = useDispatch<AppDispatch>()

    const isApiCall = useRef<boolean>(false)
    useEffect(() => {
        if(!isFetchedWareHouse && !isApiCall.current){
            isApiCall.current = true
            dispatch(getAllWarehouses())
        }else{
          isApiCall.current = false
        }
    }, [isFetchedWareHouse])
  return (
  null
  )
}

export default GetAllWareHouse