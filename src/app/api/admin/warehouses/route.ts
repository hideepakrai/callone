import dbConnect from "@/lib/db/connection";
import { Warehouse } from "@/lib/db/models/Warehouse";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const warehouses = await Warehouse.find({});

    return NextResponse.json(warehouses, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    // If setting as default, unset other default warehouses first
    if (body.isDefault) {
      await Warehouse.updateMany({}, { isDefault: false });
    }

    const newWarehouse = await Warehouse.create(body);
    return NextResponse.json(newWarehouse, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // ✅ Validate ID exists
    if (!id) {
      return NextResponse.json(
        { message: "ID is required" },
        { status: 400 }
      );
    }

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // ✅ Handle isDefault logic
    if (body.isDefault === true) {
      await Warehouse.updateMany(
        { _id: { $ne: id } },
        { $set: { isDefault: false } } // 🔥 FIX
      );
    }

    const updatedWarehouse = await Warehouse.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedWarehouse) {
      return NextResponse.json(
        { message: "Warehouse not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Updated successfully",
        data: updatedWarehouse,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}


export async function DELETE(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // ✅ Check if id exists
    if (!id) {
      return NextResponse.json(
        { message: "ID is required" },
        { status: 400 }
      );
    }

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    // ✅ Delete
    const deletedWarehouse = await Warehouse.findByIdAndDelete(id);

    // ✅ Not found
    if (!deletedWarehouse) {
      return NextResponse.json(
        { message: "Warehouse not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Deleted successfully",
        data: deletedWarehouse,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    console.error("Delete Error:", error);

    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}