import { NextRequest, NextResponse } from "next/server";
import { getUsersByRole } from "@/lib/actions/users";
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
        $or: [
          { roleKey: { $in: possibleRoles } },
          { role: { $in: possibleRoles } }
        ],
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
