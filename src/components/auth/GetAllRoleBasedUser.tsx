"use client";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersByRole } from "@/store/slices/users/userThunks";
import { AppDispatch, RootState } from "@/store";

const GetAllRoleBasedUser = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { allManager, allRetailer, allSaleRep, isFetchedAllManager, isFetchedAllRetailer, isFetchedAllSaleRep, user } = useSelector((state: RootState) => state.user);
    const isApiManager = useRef<boolean>(false);
    const isApiRetailer = useRef<boolean>(false);
    const isApiSaleRep = useRef<boolean>(false);

    useEffect(() => {
        const role = user?.role?.toLowerCase();
        const isManagerOrAdmin = role === "super_admin" || role === "manager" || role === "admin";
           // Fetch manager
        if (!isFetchedAllManager && isManagerOrAdmin && !isApiManager.current) {
            dispatch(fetchUsersByRole("manager"));
            isApiManager.current = true;
        }else if(!isFetchedAllManager && !isManagerOrAdmin){
            isApiManager.current = false;
        }

        // fetch Retailer

        if (!isFetchedAllRetailer && isManagerOrAdmin && !isApiRetailer.current) {
            dispatch(fetchUsersByRole("retailer"));
            isApiRetailer.current = true;
        }else {
            isApiRetailer.current = false;
        }

           // fetch Sales Representative
        if (!isFetchedAllSaleRep && isManagerOrAdmin && !isApiSaleRep.current) {
            dispatch(fetchUsersByRole("sales_rep"));
            isApiSaleRep.current = true;
        }else {
            isApiSaleRep.current = false;
        }
    }, [dispatch, isFetchedAllManager, isFetchedAllRetailer, isFetchedAllSaleRep, user])
    return (
        null
    );
}

export default GetAllRoleBasedUser