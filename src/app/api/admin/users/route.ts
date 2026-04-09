import { NextRequest, NextResponse } from "next/server";
import { getUsersByRole, saveUserInternal, deleteUserInternal } from "@/lib/actions/users";
import { User } from "@/lib/db/models/User";
import dbConnect from "@/lib/db/connection";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    

    await dbConnect();
    
    let query: any = {};
    if (role) {
      const roleMap: Record<string, string[]> = {
        manager: ["Manager"],
        sales_rep: ["Sales Representative"],
        retailer: ["Retailer"],
      };
      
      const possibleRoles = roleMap[role] || [role];
      query = {
        role: { $in: possibleRoles },
        status: "active"
      };
    }

    const users = await User.find(query).select("-password_hash -new_hash_password -passwordHash").lean();
  
    return NextResponse.json({ data: users });
  } catch (error: any) {
    console.error("Error fetching users by role:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await saveUserInternal(data);
    console.log("result adsd user",result);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await saveUserInternal(data);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const result = await deleteUserInternal(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 400 }
    );
  }
}
