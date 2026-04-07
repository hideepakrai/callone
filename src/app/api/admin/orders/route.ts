import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/lib/db/connection";
import { Order } from "@/lib/db/models/Order";
import mongoose from "mongoose";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const query: any = {};

        // Filtering options
        if (searchParams.has("status")) {
            query.workflowStatus = searchParams.get("status");
        }
        if (searchParams.has("retailerId")) {
            query.retailerId = searchParams.get("retailerId");
        }
        if (searchParams.has("managerId")) {
            query.managerId = searchParams.get("managerId");
        }
        if (searchParams.has("salesRepId")) {
            query.salesRepId = searchParams.get("salesRepId");
        }

        const orders = await Order.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ data: orders, success: true });
    } catch (error: any) {
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch orders", success: false },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        const newOrder = new Order(body);
        await newOrder.save();

        return NextResponse.json({ data: newOrder, success: true }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating order:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create order", success: false },
            { status: 500 }
        );
    }
}
