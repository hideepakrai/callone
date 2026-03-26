import { toCsv } from "@/lib/utils/csv";
import { ProductCatalogRecord } from "../ProductType";

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const csv = toCsv(rows);
  const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function buildExportRows(products: ProductCatalogRecord[]) {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    baseSku: product.baseSku,
    brandCode: product.brand.code,
    brandName: product.brand.name,
    category: product.category,
    subcategory: product.subcategory,
    productType: product.productType,
    status: product.status,
    availableStock: product.availableStock,
    variantCount: product.variantCount,
    variantSkus: product.variantSkus.join(" | "),
    attributes: product.attributeGroups
      .map((group) => `${group.label}: ${group.values.join(", ")}`)
      .join(" | "),
  }));
}