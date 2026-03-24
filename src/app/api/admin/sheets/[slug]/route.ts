import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth/options";
import dbConnect from "@/lib/db/connection";
import {SheetDataset} from "@/lib/db/models/SheetDataset";
import {SheetRow} from "@/lib/db/models/SheetRow";
import {toCsv} from "@/lib/utils/csv";

export async function GET(
  request: NextRequest,
  {params}: {params: {slug: string}}
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  await dbConnect();

  const dataset = await SheetDataset.findOne({slug: params.slug}).lean();
  if (!dataset) {
    return NextResponse.json({error: "Dataset not found"}, {status: 404});
  }

  const rows = await SheetRow.find({datasetId: dataset._id}).sort({rowIndex: 1}).lean();

  if (request.nextUrl.searchParams.get("format") === "csv") {
    const csv = toCsv(
      rows.map((row) => ({
        rowIndex: row.rowIndex,
        ...row.data,
        relationStatus: row.relation.status,
        relationBrand: row.relation.brandLabel,
        relationProduct: row.relation.productLabel,
        relationVariant: row.relation.variantLabel,
        relationWarehouse: row.relation.warehouseLabel,
        relationIssues: row.relation.issues.join(" | "),
      }))
    );

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${dataset.slug}.csv"`,
      },
    });
  }

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
    rows: rows.map((row) => ({
      id: row._id.toString(),
      rowIndex: row.rowIndex,
      data: row.data,
      relation: row.relation,
      createdAt: row.createdAt,
    })),
  });
}
