

export interface ITravisMethewSheetItem {
  SKU?: string;
  Option?: string;
  desc?: string;
  SZ?: string;
  category?: string;
  season?: string;
  line?: string;
  color?: string;
  mrp?: string | number | null;
  image?: string | null;
  "TTL Qty"?: number | string | null;
  "Line status"?: string | null;
  "Size Roll"?: string | null;
  KAPIL?: number | string | null;
  MOHIT?: number | string | null;
  PUNITH?: number | string | null;
  SANDEEP?: number | string | null;
  SHASHI?: number | string | null;
  SHIVAM?: number | string | null;
  Blk?: number | string | null;
  Avl?: number | string | null;
  UPC?: number | string | null;
  TTL?: number | string | null;
  ATJ?: number | string | null;
  "B CLB"?: number | string | null;
  Overall?: number | string | null;
  ATJ_1?: number | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShowTravisSheetModal{
  baseSku?:string
  imagePath?:string
  allVariant?:ITravisMethewSheetItem[]
}
export const TRAVIS_SHEET_FIELDS = [
  "SKU",
  "Option",
  "desc",
  "SZ",
  "category",
  "season",
  "line",
  "color",
  "mrp",
  "image",
  "TTL Qty",
  "Line status",
  "Size Roll",
  "KAPIL",
  "MOHIT",
  "PUNITH",
  "SANDEEP",
  "SHASHI",
  "SHIVAM",
  "Blk",
  "Avl",
  "UPC",
  "TTL",
  "ATJ",
  "B CLB",
  "Overall",
  "ATJ_1",
] as const;

export function pickTravisSheetFields(
  item: Partial<ITravisMethewSheetItem> | Record<string, unknown>
): ITravisMethewSheetItem {
  const source = item as Record<string, unknown>;
  const output: Partial<ITravisMethewSheetItem> = {};

  TRAVIS_SHEET_FIELDS.forEach((field) => {
    if (field in source) {
      const value = source[field];
      if (value !== undefined) {
        output[field as keyof ITravisMethewSheetItem] = value as never;
      }
    }
  });

  return output;
}

export function getTravisSheetKey(item: Partial<ITravisMethewSheetItem> | Record<string, unknown>) {
  const source = item as Partial<ITravisMethewSheetItem>;
  const candidate = source.SKU ?? source.Option;
  return String(candidate ?? "").trim();
}
