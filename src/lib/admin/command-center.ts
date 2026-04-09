import type {LucideIcon} from "lucide-react";
import {
  BadgeCheck,
  FileSpreadsheet,
  FileUp,
  FolderTree,
  LayoutDashboard,
  Package,
  PlusCircle,
  Shield,
  ShoppingBag,
  Store,
  UserPlus,
  Users,
  Warehouse,
} from "lucide-react";
import {ACCOUNT_SECTIONS} from "@/lib/admin/account-sections";
import {CATALOG_SECTIONS} from "@/lib/admin/catalog-sections";

export type AdminCommandGroup = "Navigate" | "Create" | "Operations";

export type AdminCommandItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  group: AdminCommandGroup;
  keywords: string[];
  roles?: string[];
  heroImage?: string;
};

export const HERO_BANNERS = {
  graphite:
    "https://callawaytech.s3.ap-south-1.amazonaws.com/omsimages/uploads/18_b3b08ebc11.png",
  iron:
    "https://callawaytech.s3.ap-south-1.amazonaws.com/omsimages/uploads/19_582a243868.png",
  orange:
    "https://callawaytech.s3.ap-south-1.amazonaws.com/omsimages/uploads/24_8d8dd65fde.png",
};

export const ADMIN_PRODUCTS_MENU_ITEMS: AdminCommandItem[] = CATALOG_SECTIONS.map(
  (section) => ({
    id: `catalog-${section.slug}`,
    label: section.label,
    description: section.description,
    href: `/admin/products/brand/${section.slug}`,
    icon: Package,
    group: "Navigate",
    keywords: [
      "products",
      "catalog",
      "brand catalog",
      section.label,
      ...section.brandCodes,
    ],
    roles: ["super_admin", "admin", "manager", "sales_rep", "retailer"],
    heroImage: HERO_BANNERS.iron,
  })
);

export const ADMIN_ACCOUNTS_MENU_ITEMS: AdminCommandItem[] = ACCOUNT_SECTIONS.map(
  (section) => ({
    id: `accounts-${section.slug}`,
    label: section.label,
    description: section.description,
    href: `/admin/accounts/${section.slug}`,
    icon:
      section.slug === "retailers"
        ? Store
        : section.slug === "sales-representatives"
          ? BadgeCheck
          : Users,
    group: "Navigate",
    keywords: ["accounts", "users", "roles", section.label, ...section.roles],
    roles:
      section.slug === "admins" || section.slug === "all"
        ? ["super_admin", "admin"]
        : section.slug === "managers"
          ? ["super_admin", "admin", "manager"]
          : ["super_admin", "admin", "manager", "sales_rep"],
    heroImage: HERO_BANNERS.graphite,
  })
);

export const ADMIN_NAV_ITEMS: AdminCommandItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Overview, sales pulse, and daily priorities.",
    href: "/admin",
    icon: LayoutDashboard,
    group: "Navigate",
    keywords: ["overview", "home", "stats"],
    roles: ["super_admin", "admin", "manager", "sales_rep", "retailer"],
    heroImage: HERO_BANNERS.graphite,
  },
  {
    id: "orders",
    label: "Orders",
    description: "Track approvals, order movement, and customer activity.",
    href: "/admin/orders",
    icon: ShoppingBag,
    group: "Navigate",
    keywords: ["checkout", "status", "approval"],
    roles: ["super_admin", "admin", "manager", "sales_rep", "retailer"],
    heroImage: HERO_BANNERS.orange,
  },
  {
    id: "products",
    label: "Products",
    description: "Explore collections, variants, and stock-ready assortments.",
    href: "/admin/products",
    icon: Package,
    group: "Navigate",
    keywords: ["catalog", "variants", "sku", "brands"],
    roles: ["super_admin", "admin", "manager", "sales_rep", "retailer"],
    heroImage: HERO_BANNERS.iron,
  },
  {
    id: "accounts",
    label: "Accounts",
    description: "Role-wise account management, assignments, and CRUD.",
    href: "/admin/accounts",
    icon: Users,
    group: "Navigate",
    keywords: ["accounts", "users", "roles", "teams"],
    roles: ["super_admin", "admin", "manager", "sales_rep"],
    heroImage: HERO_BANNERS.graphite,
  },
  {
    id: "warehouses",
    label: "Warehouses",
    description: "Monitor locations, stock balance, and routing decisions.",
    href: "/admin/warehouses",
    icon: Warehouse,
    group: "Navigate",
    keywords: ["inventory", "stock", "availability"],
    roles: ["super_admin", "admin", "manager"],
    heroImage: HERO_BANNERS.graphite,
  },
  {
    id: "imports",
    label: "Imports",
    description: "Bring in sheets, calibration sets, and legacy source data.",
    href: "/admin/imports",
    icon: FileUp,
    group: "Navigate",
    keywords: ["migration", "upload", "seed"],
    roles: ["super_admin", "admin", "manager"],
    heroImage: HERO_BANNERS.graphite,
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Revenue trends, top products, and people insights.",
    href: "/admin/analytics",
    icon: LayoutDashboard,
    group: "Navigate",
    keywords: ["analytics", "insights", "sales", "weekly"],
    roles: ["super_admin", "admin", "manager", "sales_rep"],
    heroImage: HERO_BANNERS.orange,
  },
  // {
  //   id: "call-check",
  //   label: "Call Check",
  //   description: "Revenue trends, top products, and people insights.",
  //   href: "/admin/call-check",
  //   icon: LayoutDashboard,
  //   group: "Navigate",
  //   keywords: ["analytics", "insights", "sales", "weekly"],
  //   roles: ["super_admin", "admin", "manager", "sales_rep"],
  //   heroImage: HERO_BANNERS.orange,
  // },
];

export const ADMIN_ROUTE_ITEMS: AdminCommandItem[] = [
  ...ADMIN_NAV_ITEMS,
  ...ADMIN_PRODUCTS_MENU_ITEMS,
  ...ADMIN_ACCOUNTS_MENU_ITEMS,
  {
    id: "brands",
    label: "Brands",
    description: "Manage brand identity, logos, and collection ownership.",
    href: "/admin/brands",
    icon: FolderTree,
    group: "Navigate",
    keywords: ["brands", "logos", "collections"],
    roles: ["super_admin", "admin", "manager"],
    heroImage: HERO_BANNERS.graphite,
  },
  {
    id: "users",
    label: "Users",
    description: "Direct account management route for full user editing.",
    href: "/admin/users",
    icon: Users,
    group: "Navigate",
    keywords: ["users", "accounts", "staff"],
    roles: ["super_admin", "admin", "manager"],
    heroImage: HERO_BANNERS.graphite,
  },
  {
    id: "roles",
    label: "Roles",
    description: "Permission bundles and access rules for the workspace.",
    href: "/admin/roles",
    icon: Shield,
    group: "Navigate",
    keywords: ["permissions", "rbac", "access"],
    roles: ["super_admin", "admin"],
    heroImage: HERO_BANNERS.orange,
  },
  {
    id: "sheet-calibration",
    label: "Sheet Calibration",
    description: "Review sheet uploads, mapping, and saved intake sets.",
    href: "/admin/imports/sheet-calibration",
    icon: FileSpreadsheet,
    group: "Operations",
    keywords: ["csv", "sheet", "upload", "calibration", "mapping"],
    roles: ["super_admin", "admin", "manager"],
    heroImage: HERO_BANNERS.iron,
  },
];

export const ADMIN_COMMAND_ITEMS: AdminCommandItem[] = [
  ...ADMIN_ROUTE_ITEMS,
  {
    id: "new-order",
    label: "Create Order",
    description: "Start a fresh order and send it into the workflow.",
    href: "/admin/orders/new",
    icon: PlusCircle,
    group: "Create",
    keywords: ["new order", "checkout", "sales order"],
    roles: ["super_admin", "admin", "manager", "sales_rep"],
  },
  {
    id: "new-product",
    label: "Create Product",
    description: "Add a new product and set up its variant range.",
    href: "/admin/products/new",
    icon: PlusCircle,
    group: "Create",
    keywords: ["new product", "catalog", "sku"],
    roles: ["super_admin", "admin", "manager"],
  },
  {
    id: "manage-users",
    label: "Invite User",
    description: "Add a new workspace user and assign their scope.",
    href: "/admin/accounts/all",
    icon: UserPlus,
    group: "Create",
    keywords: ["new user", "invite", "staff"],
    roles: ["super_admin", "admin", "manager"],
  },
];
