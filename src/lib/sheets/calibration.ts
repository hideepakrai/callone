export type CalibrationLookup = {
  brands: Array<{id: string; name: string; code: string}>;
  products: Array<{
    id: string;
    name: string;
    baseSku: string;
    brandId: string;
    category: string;
    subcategory?: string;
  }>;
  variants: Array<{id: string; sku: string; productId: string; title: string}>;
  warehouses: Array<{id: string; code: string; name: string}>;
};

export type CalibratedSheetRow = {
  rowIndex: number;
  data: Record<string, unknown>;
  relation: {
    status: "matched" | "partial" | "unmatched";
    brandId: string | null;
    brandLabel: string;
    productId: string | null;
    productLabel: string;
    variantId: string | null;
    variantLabel: string;
    warehouseId: string | null;
    warehouseLabel: string;
    issues: string[];
  };
};

function normalize(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getValueByCandidates(
  data: Record<string, unknown>,
  candidates: string[]
) {
  const normalizedMap = new Map(
    Object.entries(data).map(([key, value]) => [normalize(key), value])
  );

  for (const candidate of candidates) {
    const direct = normalizedMap.get(normalize(candidate));
    if (direct != null && String(direct).trim() !== "") {
      return String(direct).trim();
    }
  }

  return "";
}

function matchBrand(
  brandValue: string,
  lookup: CalibrationLookup["brands"]
) {
  const normalizedValue = normalize(brandValue);
  if (!normalizedValue) {
    return null;
  }

  return (
    lookup.find((brand) => normalize(brand.code) === normalizedValue) ??
    lookup.find((brand) => normalize(brand.name) === normalizedValue) ??
    null
  );
}

function matchWarehouse(
  warehouseValue: string,
  lookup: CalibrationLookup["warehouses"]
) {
  const normalizedValue = normalize(warehouseValue);
  if (!normalizedValue) {
    return null;
  }

  return (
    lookup.find((warehouse) => normalize(warehouse.code) === normalizedValue) ??
    lookup.find((warehouse) => normalize(warehouse.name) === normalizedValue) ??
    null
  );
}

function matchProduct(
  baseSkuValue: string,
  nameValue: string,
  lookup: CalibrationLookup["products"]
) {
  const normalizedBaseSku = normalize(baseSkuValue);
  const normalizedName = normalize(nameValue);

  if (normalizedBaseSku) {
    const bySku = lookup.find(
      (product) => normalize(product.baseSku) === normalizedBaseSku
    );
    if (bySku) {
      return bySku;
    }
  }

  if (normalizedName) {
    return (
      lookup.find((product) => normalize(product.name) === normalizedName) ?? null
    );
  }

  return null;
}

function matchVariant(
  skuValue: string,
  lookup: CalibrationLookup["variants"]
) {
  const normalizedSku = normalize(skuValue);
  if (!normalizedSku) {
    return null;
  }

  return (
    lookup.find((variant) => normalize(variant.sku) === normalizedSku) ?? null
  );
}

export function calibrateSheetRows(
  rows: Record<string, unknown>[],
  lookup: CalibrationLookup
) {
  return rows.map<CalibratedSheetRow>((row, index) => {
    const brandValue = getValueByCandidates(row, [
      "brandCode",
      "brand",
      "brandName",
      "brand code",
      "brand name",
    ]);
    const warehouseValue = getValueByCandidates(row, [
      "warehouseCode",
      "warehouse",
      "warehouseName",
      "warehouse code",
      "warehouse name",
      "wh",
    ]);
    const productNameValue = getValueByCandidates(row, [
      "productName",
      "name",
      "product",
      "description",
    ]);
    const baseSkuValue = getValueByCandidates(row, [
      "baseSku",
      "base sku",
      "style",
      "style code",
    ]);
    const skuValue = getValueByCandidates(row, ["sku", "variantSku", "variant sku"]);

    const matchedBrand = matchBrand(brandValue, lookup.brands);
    const matchedWarehouse = matchWarehouse(warehouseValue, lookup.warehouses);
    const matchedVariant = matchVariant(skuValue, lookup.variants);
    const matchedProduct =
      (matchedVariant
        ? lookup.products.find((product) => product.id === matchedVariant.productId) ?? null
        : null) ?? matchProduct(baseSkuValue, productNameValue, lookup.products);

    const issues: string[] = [];

    if (brandValue && !matchedBrand) {
      issues.push(`Brand not matched: ${brandValue}`);
    }
    if (warehouseValue && !matchedWarehouse) {
      issues.push(`Warehouse not matched: ${warehouseValue}`);
    }
    if (baseSkuValue && !matchedProduct && !matchedVariant) {
      issues.push(`Base SKU not matched: ${baseSkuValue}`);
    }
    if (skuValue && !matchedVariant) {
      issues.push(`Variant SKU not matched: ${skuValue}`);
    }
    if (!brandValue && !warehouseValue && !baseSkuValue && !skuValue) {
      issues.push("No calibration keys found in row.");
    }

    const relationHits = [
      matchedBrand ? 1 : 0,
      matchedWarehouse ? 1 : 0,
      matchedProduct ? 1 : 0,
      matchedVariant ? 1 : 0,
    ].reduce((sum, value) => sum + value, 0);

    const status: CalibratedSheetRow["relation"]["status"] =
      issues.length === 0 && relationHits > 0
        ? "matched"
        : relationHits > 0
          ? "partial"
          : "unmatched";

    return {
      rowIndex: index + 1,
      data: row,
      relation: {
        status,
        brandId: matchedBrand?.id ?? null,
        brandLabel: matchedBrand ? `${matchedBrand.code} · ${matchedBrand.name}` : "",
        productId: matchedProduct?.id ?? null,
        productLabel: matchedProduct
          ? `${matchedProduct.baseSku} · ${matchedProduct.name}`
          : "",
        variantId: matchedVariant?.id ?? null,
        variantLabel: matchedVariant
          ? `${matchedVariant.sku} · ${matchedVariant.title}`
          : "",
        warehouseId: matchedWarehouse?.id ?? null,
        warehouseLabel: matchedWarehouse
          ? `${matchedWarehouse.code} · ${matchedWarehouse.name}`
          : "",
        issues,
      },
    };
  });
}

export function summarizeCalibratedRows(rows: CalibratedSheetRow[]) {
  return rows.reduce(
    (summary, row) => {
      summary.total += 1;
      summary[row.relation.status] += 1;
      summary.issueCount += row.relation.issues.length ? 1 : 0;
      return summary;
    },
    {total: 0, matched: 0, partial: 0, unmatched: 0, issueCount: 0}
  );
}
