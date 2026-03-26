"use client"
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { fetchTravisMathew } from '@/store/slices/travisMathewSlice/travisMathewThunks'


const GetAllTravisMethew = () => {

    const dispatch= useDispatch<AppDispatch>()
    const isApiCall= useRef<boolean>(false)

    const {isFetchedTravismathew,travismathew}=useSelector((state:RootState)=>state.travisMathew)
    useEffect(() => {
      if(!isApiCall.current && !isFetchedTravismathew){
        dispatch(fetchTravisMathew())
        isApiCall.current=true
      }else{
        isApiCall.current=false
      }
    }, [isFetchedTravismathew])
  return (
   null
  )
}

export default GetAllTravisMethew