import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";
import {Role} from "@/lib/db/models/Role";
import {User} from "@/lib/db/models/User";
import {Warehouse} from "@/lib/db/models/Warehouse";
import {ROLE_PERMISSIONS, type RoleKey} from "@/lib/auth/permissions";
import {slugify} from "@/lib/utils/slugify";

const ROLE_LABELS: Record<RoleKey, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  sales_rep: "Sales Representative",
  retailer: "Retailer",
};

export async function ensureSystemBootstrap() {
  if (process.env.CALLONE_DISABLE_SYSTEM_BOOTSTRAP === "true") {
    return;
  }

  try {
    console.log("BOOTSTRAP_INFO: Starting system bootstrap...");
    await dbConnect();

    // Phase 1: Roles
    console.log("BOOTSTRAP_INFO: Syncing roles...");
    for (const [key, permissions] of Object.entries(ROLE_PERMISSIONS) as Array<
      [RoleKey, string[]]
    >) {
      await Role.findOneAndUpdate(
        {key},
        {
          $setOnInsert: {
            name: ROLE_LABELS[key],
            description: `${ROLE_LABELS[key]} role for CallawayOne`,
            permissions,
            isSystem: true,
            isActive: true,
          },
        },
        {returnDocument: "after", upsert: true}
      );
    }

    const adminEmail =
      process.env.CALLONE_BOOTSTRAP_ADMIN_EMAIL ?? "admin@callone.local";
    const adminPassword =
      process.env.CALLONE_BOOTSTRAP_ADMIN_PASSWORD ?? "CalloneAdmin@123";
    const bootstrapPasswordHash = await bcrypt.hash(adminPassword, 10);

    // Phase 2: Super Admin
    console.log("BOOTSTRAP_INFO: Checking super admin user...");
    const existingUser = await User.findOne({email: adminEmail.toLowerCase()});
    const superAdminRole = await Role.findOne({key: "super_admin"});
    if (!superAdminRole) {
      console.error("BOOTSTRAP_ERROR: Missing super_admin role during bootstrap.");
      throw new Error("Missing super_admin role during bootstrap.");
    }

    if (!existingUser) {
      console.log(`BOOTSTRAP_INFO: Creating bootstrap admin ${adminEmail}...`);
      await User.create({
        name: "CallawayOne Super Admin",
        email: adminEmail.toLowerCase(),
        passwordHash: bootstrapPasswordHash,
        roleId: superAdminRole._id,
        role: superAdminRole.key,
        roleKey: superAdminRole.key,
        designation: "Bootstrap Admin",
        status: "active",
      });
    } else {
      await User.findByIdAndUpdate(existingUser._id, {
        $set: {
          passwordHash: bootstrapPasswordHash,
          roleId: superAdminRole._id,
          role: superAdminRole.key,
          roleKey: superAdminRole.key,
          status: "active",
        },
      });
    }

    // Phase 3: Brands
    console.log("BOOTSTRAP_INFO: Syncing default brands...");
    const defaultBrands = [
      {name: "Callaway Hardgoods", code: "CG-HW"},
      {name: "Callaway Apparel", code: "CG-APP"},
      {name: "Travis Mathew", code: "TM"},
      {name: "Ogio", code: "OG"},
    ];

    for (const brand of defaultBrands) {
      await Brand.findOneAndUpdate(
        {code: brand.code},
        {
          $setOnInsert: {
            name: brand.name,
            slug: slugify(brand.name),
            description: `${brand.name} imported bootstrap brand`,
            media: {
              logoPath: "",
              thumbnailPath: "",
              sliderPaths: [],
            },
            isActive: true,
          },
        },
        {upsert: true, returnDocument: "after"}
      );
    }

    // Phase 4: Warehouses
    console.log("BOOTSTRAP_INFO: Syncing default warehouses...");
    const defaultWarehouses = [
      {code: "WH88", name: "Warehouse 88", location: "Legacy WH 88", priority: 10, isDefault: true},
      {code: "WH90", name: "Warehouse 90", location: "Legacy WH 90", priority: 20, isDefault: false},
    ];

    for (const warehouse of defaultWarehouses) {
      await Warehouse.findOneAndUpdate(
        {code: warehouse.code},
        {
          $setOnInsert: {
            ...warehouse,
            isActive: true,
          },
        },
        {upsert: true, returnDocument: "after"}
      );
    }

    // Phase 5: Seed Users
    console.log("BOOTSTRAP_INFO: Syncing seed users...");
    const managerRole = await Role.findOne({key: "manager"});
    const salesRepRole = await Role.findOne({key: "sales_rep"});
    const retailerRole = await Role.findOne({key: "retailer"});

    const managerEmail = process.env.CALLONE_BOOTSTRAP_MANAGER_EMAIL ?? "manager@callone.local";
    const salesEmail = process.env.CALLONE_BOOTSTRAP_SALES_EMAIL ?? "sales@callone.local";
    const retailerEmail = process.env.CALLONE_BOOTSTRAP_RETAILER_EMAIL ?? "retailer@callone.local";

    const seedUsers = [
      {
        email: managerEmail,
        name: "Regional Manager",
        role: managerRole,
        designation: "Regional Sales Manager",
      },
      {
        email: salesEmail,
        name: "Field Sales Rep",
        role: salesRepRole,
        designation: "Sales Executive",
      },
      {
        email: retailerEmail,
        name: "Partner Retailer",
        role: retailerRole,
        designation: "Retail Partner",
      },
    ];

    for (const candidate of seedUsers) {
      if (!candidate.role) {
        continue;
      }

      const present = await User.findOne({email: candidate.email});
      if (present) {
        await User.findByIdAndUpdate(present._id, {
          $set: {
            passwordHash: bootstrapPasswordHash,
            roleId: candidate.role._id,
            role: candidate.role.key,
            roleKey: candidate.role.key,
            designation: candidate.designation,
            status: "active",
          },
        });
      } else {
        await User.create({
          name: candidate.name,
          email: candidate.email,
          passwordHash: bootstrapPasswordHash,
          roleId: candidate.role._id,
          role: candidate.role.key,
          roleKey: candidate.role.key,
          designation: candidate.designation,
          status: "active",
        });
      }
    }
    console.log("BOOTSTRAP_SUCCESS: System bootstrap completed successfully.");
  } catch (error: any) {
    console.error("BOOTSTRAP_ERROR: Critical failure during system bootstrap:", error.message || error);
    throw error;
  }
}
