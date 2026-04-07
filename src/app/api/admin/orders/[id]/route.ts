import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/lib/db/connection";
import { Order } from "@/lib/db/models/Order";
import mongoose from "mongoose";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const order = await Order.findById(params.id);
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ data: order, success: true });
    } catch (error: any) {
        console.error("Error fetching order:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch order", success: false },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();
        
        // Update order with body and handle mapping if needed
        const updatedOrder = await Order.findByIdAndUpdate(
            params.id,
            { ...body, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ data: updatedOrder, success: true });
    } catch (error: any) {
        console.error("Error updating order:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update order", success: false },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const result = await Order.deleteOne({ _id: params.id });
        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting order:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete order", success: false },
            { status: 500 }
        );
    }
}
