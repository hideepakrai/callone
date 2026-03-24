import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth/options";
import {SheetDataset} from "@/lib/db/models/SheetDataset";
import {SheetRow} from "@/lib/db/models/SheetRow";
import {calibrateSheetRows, summarizeCalibratedRows} from "@/lib/sheets/calibration";
import {loadCalibrationLookup} from "@/lib/sheets/load-calibration-lookup";
import {slugify} from "@/lib/utils/slugify";

type SheetPayload = {
  name?: string;
  description?: string;
  sourceFileName?: string;
  type?: "brand_calibration" | "generic";
  columns?: string[];
  rows?: Record<string, unknown>[];
};

async function ensureUniqueSlug(baseSlug: string) {
  const slug = baseSlug || "sheet-dataset";

  const existing = await SheetDataset.find({slug: new RegExp(`^${slug}(-\\d+)?$`, "i")})
    .select("slug")
    .lean();

  if (!existing.length) {
    return slug;
  }

  const reserved = new Set(existing.map((item) => item.slug));
  let counter = 2;

  while (reserved.has(`${slug}-${counter}`)) {
    counter += 1;
  }

  return `${slug}-${counter}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  const lookup = await loadCalibrationLookup();
  const datasets = await SheetDataset.find().sort({createdAt: -1}).lean();

  return NextResponse.json({
    datasets: datasets.map((dataset) => ({
      id: dataset._id.toString(),
      name: dataset.name,
      slug: dataset.slug,
      type: dataset.type,
      sourceFileName: dataset.sourceFileName,
      description: dataset.description,
      columns: dataset.columns,
      rowCount: dataset.rowCount,
      summary: dataset.summary,
      createdAt: dataset.createdAt,
    })),
    lookupSummary: {
      brands: lookup.brands.length,
      products: lookup.products.length,
      variants: lookup.variants.length,
      warehouses: lookup.warehouses.length,
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  const body = (await request.json()) as SheetPayload;
  const rows = Array.isArray(body.rows) ? body.rows : [];

  if (!rows.length) {
    return NextResponse.json({error: "At least one row is required."}, {status: 400});
  }

  const datasetName =
    body.name?.trim() ||
    body.sourceFileName?.replace(/\.[^.]+$/, "").trim() ||
    `Calibration ${new Date().toISOString().slice(0, 10)}`;

  const columns = Array.isArray(body.columns) && body.columns.length
    ? body.columns
    : Array.from(
        rows.reduce((set, row) => {
          Object.keys(row).forEach((key) => set.add(key));
          return set;
        }, new Set<string>())
      );

  const slug = await ensureUniqueSlug(slugify(datasetName));
  const lookup = await loadCalibrationLookup();
  const calibratedRows = calibrateSheetRows(rows, lookup);
  const summary = summarizeCalibratedRows(calibratedRows);

  const dataset = await SheetDataset.create({
    name: datasetName,
    slug,
    type: body.type ?? "brand_calibration",
    sourceFileName: body.sourceFileName?.trim() ?? "",
    description: body.description?.trim() ?? "",
    columns,
    rowCount: calibratedRows.length,
    summary: {
      matched: summary.matched,
      partial: summary.partial,
      unmatched: summary.unmatched,
      issueCount: summary.issueCount,
    },
  });

  await SheetRow.insertMany(
    calibratedRows.map((row) => ({
      datasetId: dataset._id,
      rowIndex: row.rowIndex,
      data: row.data,
      relation: row.relation,
    }))
  );

  return NextResponse.json({
    dataset: {
      id: dataset._id.toString(),
      name: dataset.name,
      slug: dataset.slug,
      type: dataset.type,
      sourceFileName: dataset.sourceFileName,
      description: dataset.description,
      columns: dataset.columns,
      rowCount: dataset.rowCount,
      summary: dataset.summary,
      createdAt: dataset.createdAt,
    },
    rows: calibratedRows,
  });
}
