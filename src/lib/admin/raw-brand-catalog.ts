import mongoose from "mongoose";
import dbConnect from "@/lib/db/connection";

export type RawBrandCatalogSource = {
  brandCode: string;
  brandLabel: string;
  sectionSlug: string;
  collectionName: string;
  groupingRule: string;
  variantAxes: string[];
  productAttributes: string[];
  warehouseColumns: string[];
  mediaMode: string;
  importCadence: string;
  caution: string;
};

export type RawBrandCatalogSourceSummary = RawBrandCatalogSource & {
  hasCollection: boolean;
  rowCount: number;
};

export const RAW_BRAND_CATALOG_SOURCES: RawBrandCatalogSource[] = [
  {
    brandCode: "CG-APP",
    brandLabel: "Callaway Softgoods",
    sectionSlug: "callaway-softgoods",
    collectionName: "product_softgoods",
    groupingRule: "style_id + gender, with SKU fallback for missing style_id rows",
    variantAxes: ["color", "size"],
    productAttributes: ["category", "gender"],
    warehouseColumns: ["stock_88", "stock_90"],
    mediaMode: "Separate image lane",
    importCadence: "Catalog refresh + daily inventory updates",
    caution:
      "style_id is missing in part of the source data, so grouping must stay configurable and validated before save.",
  },
  {
    brandCode: "CG-HW",
    brandLabel: "Callaway Hardgoods",
    sectionSlug: "callaway-hardgoods",
    collectionName: "product_hardgoods",
    groupingRule: "product_model + product_type",
    variantAxes: ["orientation"],
    productAttributes: ["category", "product_type"],
    warehouseColumns: ["stock_88"],
    mediaMode: "Separate image lane",
    importCadence: "Catalog refresh + inventory updates",
    caution:
      "product_model spans multiple product types, so grouping by model alone will merge unrelated hardgoods.",
  },
  {
    brandCode: "OG",
    brandLabel: "Ogio",
    sectionSlug: "ogio",
    collectionName: "product_ogio",
    groupingRule: "product_model",
    variantAxes: ["sku"],
    productAttributes: ["category", "product_type"],
    warehouseColumns: ["stock_90"],
    mediaMode: "Separate image lane using primary_image_url and gallery_images_url",
    importCadence: "Catalog refresh + daily inventory updates",
    caution:
      "most rows carry media references already, but inventory is still source-driven and should be imported independently.",
  },
  {
    brandCode: "TM",
    brandLabel: "Travis Mathew",
    sectionSlug: "travis-mathew",
    collectionName: "product_travis",
    groupingRule: "style_code, while keeping season and line as filterable attributes",
    variantAxes: ["color", "size"],
    productAttributes: ["category", "gender", "season", "line", "family"],
    warehouseColumns: ["stock_88", "stock_90"],
    mediaMode: "Separate image lane",
    importCadence: "Catalog refresh + daily inventory updates",
    caution:
      "season, line, and color values need normalization before they become shared catalog filters.",
  },
];

export async function loadRawBrandCatalogSourceSummaries() {
  await dbConnect();

  const database = mongoose.connection.db;
  if (!database) {
    return RAW_BRAND_CATALOG_SOURCES.map<RawBrandCatalogSourceSummary>((source) => ({
      ...source,
      hasCollection: false,
      rowCount: 0,
    }));
  }

  const collections = await database.listCollections({}, {nameOnly: true}).toArray();
  const collectionNames = new Set(collections.map((collection) => collection.name));

  return Promise.all(
    RAW_BRAND_CATALOG_SOURCES.map(async (source) => {
      const hasCollection = collectionNames.has(source.collectionName);
      const rowCount = hasCollection
        ? await database.collection(source.collectionName).countDocuments()
        : 0;

      return {
        ...source,
        hasCollection,
        rowCount,
      } satisfies RawBrandCatalogSourceSummary;
    })
  );
}
