import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth/options";
import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    await dbConnect();
    
    // Parse URL for search parameters if needed
    const { searchParams } = new URL(request.url);
    const query: any = {};
    
    // Example: allow filtering by active status
    if (searchParams.has('isActive')) {
      query.isActive = searchParams.get('isActive') === 'true';
    }

    const brands = await Brand.find(query).sort({ createdAt: -1 });

    return NextResponse.json({data: brands, success: true});
  } catch (error: any) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      {error: error.message || "Failed to fetch brands", success: false},
      {status: 500}
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    await dbConnect();
    const body = await request.json();
    
    const brand = await Brand.create(body);

    return NextResponse.json({data: brand, success: true}, {status: 201});
  } catch (error: any) {
    console.error("Error creating brand:", error);
    // Handle Mongoose duplicate key errors gracefully
    if (error.code === 11000) {
      return NextResponse.json(
        {error: "A brand with this code or slug already exists", success: false},
        {status: 409}
      );
    }
    
    return NextResponse.json(
      {error: error.message || "Failed to create brand", success: false},
      {status: 500}
    );
  }
}
