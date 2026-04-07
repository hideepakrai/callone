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

  const softgoods = useSelector((state: RootState) => state.softgoods.softgoods);
  const hardgoods = useSelector((state: RootState) => state.hardgoods.hardgoods);
  const ogio = useSelector((state: RootState) => state.ogio.ogio);
  const travis = useSelector(
    (state: RootState) => state.travisMathew.travismathew
  );

  const products = useMemo(() => {
    if (!section) return [];

    const config = RAW_CATALOG_CONFIGS.find(
      (c) => c.sectionSlug === section.slug
    );
    if (!config) return [];

    let rawData: any[] = [];
    if (section.slug === "callaway-softgoods") rawData = softgoods;
    else if (section.slug === "callaway-hardgoods") rawData = hardgoods;
    else if (section.slug === "ogio") rawData = ogio;
    else if (section.slug === "travis-mathew") rawData = travis;

    if (!rawData || rawData.length === 0) return [];

    return transformRawRecords(config, rawData);
  }, [section, softgoods, hardgoods, ogio, travis]);

  if (!section) {
    notFound();
  }

  const collectionName = RAW_CATALOG_CONFIGS.find(
    (c) => c.sectionSlug === section.slug
  )?.collectionName;

  return (
    <>
      <GetAllSoftGood />
      <GetAllHardGood />
      <GetAllOgio />
      <GetAllTravisMethew />

      {products.length > 0 ? (
        <>
          {section.slug === "ogio" && (
            <OgioCatalogWorkspace
              products={products}
              mode="source_readonly"
              sourceCollectionName={collectionName}
            />
          )}

          {section.slug === "callaway-hardgoods" && (
            <HardgoodCatalogWorkspace
              products={products}
              mode="source_readonly"
              sourceCollectionName={collectionName}
            />
          )}

          {section.slug === "callaway-softgoods" && (
            <SoftgoodCatalogWorkspace
              products={products}
              mode="source_readonly"
              sourceCollectionName={collectionName}
            />
          )}

          {section.slug === "travis-mathew" && (
            <TravisCatalogWorkspace
              products={products}
              mode="source_readonly"
              sourceCollectionName={collectionName}
            />
          )}
        </>
      ) : (
        <div className="flex h-[400px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 p-12 text-center transition-all hover:border-white/20">
          <div className="max-w-md space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <div className="h-2 w-2 animate-ping rounded-full bg-primary" />
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">
              Loading Catalog...
            </h3>
            <p className="text-sm text-white/50 leading-relaxed font-medium">
              We are preparing the {section.label} product data from the store.
              This will only take a moment.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
