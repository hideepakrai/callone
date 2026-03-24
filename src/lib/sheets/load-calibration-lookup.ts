import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";
import {Product} from "@/lib/db/models/Product";
import {Variant} from "@/lib/db/models/Variant";
import {Warehouse} from "@/lib/db/models/Warehouse";
import type {CalibrationLookup} from "@/lib/sheets/calibration";

export async function loadCalibrationLookup(): Promise<CalibrationLookup> {
  await dbConnect();

  const [brands, products, variants, warehouses] = await Promise.all([
    Brand.find().lean(),
    Product.find().lean(),
    Variant.find().lean(),
    Warehouse.find().lean(),
  ]);

  return {
    brands: brands.map((brand) => ({
      id: brand._id.toString(),
      name: brand.name,
      code: brand.code,
    })),
    products: products.map((product) => ({
      id: product._id.toString(),
      name: product.name,
      baseSku: product.baseSku,
      brandId: String(product.brandId),
      category: product.category,
      subcategory: product.subcategory,
    })),
    variants: variants.map((variant) => ({
      id: variant._id.toString(),
      sku: variant.sku,
      productId: String(variant.productId),
      title: variant.title,
    })),
    warehouses: warehouses.map((warehouse) => ({
      id: warehouse._id.toString(),
      code: warehouse.code,
      name: warehouse.name,
    })),
  };
}
