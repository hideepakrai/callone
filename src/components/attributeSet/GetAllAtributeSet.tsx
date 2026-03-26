"use client"
import { AppDispatch, RootState } from '@/store'
import { fetchAttributes } from '@/store/slices/attributeSlice/attributeThunks'
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const GetAllAtributeSet = () => {

  const isApi= useRef<Boolean>(false)
    const dispatch=useDispatch<AppDispatch>()
  const {isFetchedAttribute}= useSelector((state:RootState)=>state.attribute)

  useEffect(()=>{
    if(!isFetchedAttribute && !isApi.current){
      isApi.current=true
      dispatch(fetchAttributes())
    }else{
        isApi.current=false
    }
  },[isFetchedAttribute])

    
  return (
  null
  )
}

export default GetAllAtributeSet