"use client";

import { useMemo } from "react";
import { notFound } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getCatalogSection } from "@/lib/admin/catalog-sections";
import {
  RAW_CATALOG_CONFIGS,
  transformRawRecords,
} from "@/lib/admin/catalog-transformer";

import { OgioCatalogWorkspace } from "@/components/products/Ogio/OgioCatalogWorkspace";
import { HardgoodCatalogWorkspace } from "@/components/products/callaway-hardgoods/HardgoodCatalogWorkspace";
import { SoftgoodCatalogWorkspace } from "@/components/products/callaway-softgoods/SoftgoodCatalogWorkspace";
import { TravisCatalogWorkspace } from "@/components/products/travismethew/TravisCatalogWorkspace";

import GetAllSoftGood from "@/components/products/callaway-softgoods/GetAllSoftGood";
import GetAllHardGood from "@/components/products/HardGood/GetAllHardGood";
import GetAllOgio from "@/components/products/Ogio/GetAllOgio";
import GetAllTravisMethew from "@/components/products/travismethew/GetAllTravisMethew";

export default function ProductSectionPage({
  params,
}: {
  params: { section: string };
}) {
  const section = getCatalogSection(params.section);

  // const { softgoods, isLoading: isLoadingSoftgoods } = useSelector((state: RootState) => state.softgoods);
  // const { hardgoods, isLoading: isLoadingHardgoods } = useSelector((state: RootState) => state.hardgoods);
  // const { ogio, isLoading: isLoadingOgio } = useSelector((state: RootState) => state.ogio);
  // const { travismathew: travis, isLoading: isLoadingTravis } = useSelector(
  //   (state: RootState) => state.travisMathew
  // );

  // const isLoading = useMemo(() => {
  //   if (!section) return false;
  //   if (section.slug === "callaway-softgoods") return isLoadingSoftgoods;
  //   if (section.slug === "callaway-hardgoods") return isLoadingHardgoods;
  //   if (section.slug === "ogio") return isLoadingOgio;
  //   if (section.slug === "travis-mathew") return isLoadingTravis;
  //   return false;
  // }, [section, isLoadingSoftgoods, isLoadingHardgoods, isLoadingOgio, isLoadingTravis]);

  // const products = useMemo(() => {
  //   if (!section) return [];

  //   const config = RAW_CATALOG_CONFIGS.find(
  //     (c) => c.sectionSlug === section.slug
  //   );
  //   if (!config) return [];

  //   let rawData: any[] = [];
  //   if (section.slug === "callaway-softgoods") rawData = softgoods;
  //   else if (section.slug === "callaway-hardgoods") rawData = hardgoods;
  //   else if (section.slug === "ogio") rawData = ogio;
  //   else if (section.slug === "travis-mathew") rawData = travis;

  //   if (!rawData || rawData.length === 0) return [];

  //   return transformRawRecords(config, rawData);
  // }, [section, softgoods, hardgoods, ogio, travis]);

  if (!section) {
    notFound();
  }

  const collectionName = RAW_CATALOG_CONFIGS.find(
    (c) => c.sectionSlug === section.slug
  )?.collectionName;

  // const showWorkspace = products.length > 0 || isLoading;

  return (
    <>
      <GetAllSoftGood />
      <GetAllHardGood />
      <GetAllOgio />
      <GetAllTravisMethew />

    
        <>
          {section.slug === "ogio" && (
            <OgioCatalogWorkspace
              // products={products}
              mode="source_readonly"
              sourceCollectionName={collectionName}
              // isLoading={isLoading}
              initialViewMode="sku"
            />
          )}

          {section.slug === "callaway-hardgoods" && (
            <HardgoodCatalogWorkspace
              // products={products}
              mode="source_readonly"
              sourceCollectionName={collectionName}
              // isLoading={isLoading}
              initialViewMode="sku"
            />
          )}

          {section.slug === "callaway-softgoods" && (
            <SoftgoodCatalogWorkspace
              // products={products}
              mode="source_readonly"
              sourceCollectionName={collectionName}
              // isLoading={isLoading}
              initialViewMode="sku"
            />
          )}

          {section.slug === "travis-mathew" && (
            <TravisCatalogWorkspace
              // products={products}
              mode="source_readonly"
              sourceCollectionName={collectionName}
              // isLoading={isLoading}
              initialViewMode="sku"
            />
          )}
        </>
  
    </>
  );
}
