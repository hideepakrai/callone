import {ACCOUNT_SECTIONS} from "@/lib/admin/account-sections";
import {CATALOG_SECTIONS} from "@/lib/admin/catalog-sections";

export type HeroAction = {
  label: string;
  href: string;
  tone?: "primary" | "secondary";
};

export type AdminPageMeta = {
  title: string;
  eyebrow: string;
  description: string;
  actions: HeroAction[];
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

function findCatalogLabel(slug: string) {
  return CATALOG_SECTIONS.find((section) => section.slug === slug)?.label ?? "Products";
}

function findAccountLabel(slug: string) {
  return ACCOUNT_SECTIONS.find((section) => section.slug === slug)?.label ?? "Accounts";
}

function getLeafSegment(pathname: string) {
  return pathname.split("/").filter(Boolean).at(-1) ?? "";
}

export function getAdminPageMeta(pathname: string): AdminPageMeta {
  if (pathname === "/admin") {
    return {
      title: "Run the day with clarity",
      eyebrow: "Live workspace visibility",
      description:
        "See the strongest signals first, then move into orders, stock, and account actions without losing context.",
      actions: [
        {label: "Open analytics", href: "/admin/analytics", tone: "secondary"},
        {label: "Review orders", href: "/admin/orders", tone: "primary"},
      ],
    };
  }

  if (pathname === "/admin/analytics") {
    return {
      title: "See where value is building",
      eyebrow: "Revenue, products, and people",
      description:
        "Track weekly flow, top movers, accountable teams, and the product lines carrying the most demand.",
      actions: [{label: "Open orders", href: "/admin/orders", tone: "primary"}],
    };
  }

  if (pathname === "/admin/orders") {
    return {
      title: "Move every order forward",
      eyebrow: "Workflow, totals, and approvals",
      description:
        "Review requests, identify delays quickly, and keep the approval chain moving with financial clarity.",
      actions: [
        {label: "Export CSV", href: "/api/admin/export/orders", tone: "secondary"},
        {label: "Create order", href: "/admin/orders/new", tone: "primary"},
      ],
    };
  }

  if (pathname === "/admin/orders/new" || pathname === "/admin/cart") {
    return {
      title: "Build the order with confidence",
      eyebrow: "Retailer-led assisted ordering",
      description:
        "Pick the right account, assign the right warehouse, and carry discount logic through a cleaner multi-step flow.",
      actions: [{label: "Back to orders", href: "/admin/orders", tone: "secondary"}],
    };
  }

  if (/^\/admin\/orders\/[^/]+$/.test(pathname)) {
    return {
      title: "Review the order in detail",
      eyebrow: "Status, lines, and decision notes",
      description:
        "Use the full snapshot of participants, items, amounts, and notes before updating the workflow.",
      actions: [{label: "Back to orders", href: "/admin/orders", tone: "secondary"}],
    };
  }

  if (/^\/admin\/products\/brand\/[^/]+$/.test(pathname)) {
    const sectionLabel = findCatalogLabel(getLeafSegment(pathname));
    return {
      title: sectionLabel,
      eyebrow: "Brand-aware assortment management",
      description:
        "Filter hard, sort fast, and manage stock-ready variants with shared media and warehouse-aware availability.",
      actions: [
        {label: "Export CSV", href: "/api/admin/export/products", tone: "secondary"},
        {label: "Open imports", href: "/admin/imports", tone: "primary"},
      ],
    };
  }

  if (pathname === "/admin/products/new") {
    return {
      title: "Create a reusable product style",
      eyebrow: "Catalog definition",
      description:
        "Set the core style once, generate the size or option variants automatically, and keep the shared image set attached to the product.",
      actions: [{label: "Back to products", href: "/admin/products", tone: "secondary"}],
    };
  }

  if (/^\/admin\/products\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: "Refine the product structure",
      eyebrow: "Catalog maintenance",
      description:
        "Update options, image strategy, and style-level metadata without breaking the linked variant inventory.",
      actions: [{label: "Back to products", href: "/admin/products", tone: "secondary"}],
    };
  }

  if (/^\/admin\/accounts\/[^/]+$/.test(pathname)) {
    const sectionLabel = findAccountLabel(getLeafSegment(pathname));
    return {
      title: sectionLabel,
      eyebrow: "Roles, assignments, and account actions",
      description:
        "Keep brands, warehouses, managers, and retailer ordering relationships organized in one grouped workspace.",
      actions: [
        {label: "Export accounts", href: "/api/admin/export/users", tone: "secondary"},
        {label: "Open roles", href: "/admin/roles", tone: "primary"},
      ],
    };
  }

  if (pathname === "/admin/brands") {
    return {
      title: "Shape each brand cleanly",
      eyebrow: "Identity, media, and ownership",
      description:
        "Keep brand presentation, codes, and collection ownership consistent before catalog and order work begins.",
      actions: [{label: "Export CSV", href: "/api/admin/export/brands", tone: "secondary"}],
    };
  }

  if (/^\/admin\/brands\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: "Refine brand presentation",
      eyebrow: "Brand maintenance",
      description:
        "Adjust media paths, naming, and catalog ownership details without losing the connected product structure.",
      actions: [{label: "Back to brands", href: "/admin/brands", tone: "secondary"}],
    };
  }

  if (pathname === "/admin/warehouses") {
    return {
      title: "Keep warehouse logic trustworthy",
      eyebrow: "Stock routing and availability",
      description:
        "Manage the live warehouse structure behind stock 88 and stock 90 while keeping inventory decisions visible.",
      actions: [{label: "Export CSV", href: "/api/admin/export/warehouses", tone: "secondary"}],
    };
  }

  if (/^\/admin\/warehouses\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: "Adjust warehouse behavior",
      eyebrow: "Warehouse maintenance",
      description:
        "Update routing, defaults, and location metadata without disturbing the inventory ledger behind it.",
      actions: [{label: "Back to warehouses", href: "/admin/warehouses", tone: "secondary"}],
    };
  }

  if (pathname === "/admin/users") {
    return {
      title: "Manage direct user records",
      eyebrow: "Auth and account maintenance",
      description:
        "Use the focused user maintenance route for direct admin edits outside the grouped accounts workspace.",
      actions: [{label: "Export CSV", href: "/api/admin/export/users", tone: "secondary"}],
    };
  }

  if (/^\/admin\/users\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: "Adjust user access cleanly",
      eyebrow: "User maintenance",
      description:
        "Update login identity, role, and assignments while keeping reporting and brand access coherent.",
      actions: [{label: "Back to users", href: "/admin/users", tone: "secondary"}],
    };
  }

  if (pathname === "/admin/roles") {
    return {
      title: "Keep permissions structured",
      eyebrow: "Reusable access bundles",
      description:
        "Define and maintain permission sets that match how the operational roles really work in the workspace.",
      actions: [{label: "Export CSV", href: "/api/admin/export/roles", tone: "secondary"}],
    };
  }

  if (/^\/admin\/roles\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: "Refine the role definition",
      eyebrow: "Permission maintenance",
      description:
        "Adjust the access bundle deliberately before it affects the people and views attached to it.",
      actions: [{label: "Back to roles", href: "/admin/roles", tone: "secondary"}],
    };
  }

  if (pathname === "/admin/imports") {
    return {
      title: "Bring external sheets in carefully",
      eyebrow: "Calibration and intake",
      description:
        "Validate columns, warehouse signals, and brand relations before imported data shapes the live workspace.",
      actions: [
        {label: "Download sample", href: "/sample-data/brand-calibration.csv", tone: "secondary"},
        {label: "Open calibration", href: "/admin/imports/sheet-calibration", tone: "primary"},
      ],
    };
  }

  if (pathname === "/admin/imports/sheet-calibration") {
    return {
      title: "Calibrate every sheet before it lands",
      eyebrow: "Product, warehouse, and brand matching",
      description:
        "Map rows to the right product structure, validate stock columns, and save intake datasets that are worth trusting.",
      actions: [{label: "Download sample", href: "/sample-data/brand-calibration.csv", tone: "secondary"}],
    };
  }

  if (pathname === "/admin/customizer") {
    return {
      title: "Explore the custom build workflow",
      eyebrow: "Future guided personalization",
      description:
        "Keep the concept available without letting it overpower the core admin ordering and catalog work.",
      actions: [{label: "Open orders", href: "/admin/orders", tone: "secondary"}],
    };
  }

  return {
    title: "CallawayOne Workspace",
    eyebrow: "Connected admin operations",
    description: "One clean surface for the catalog, accounts, warehouse, and order flow.",
    actions: [],
  };
}

export function getAdminBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === "/admin") {
    return [{label: "Dashboard"}];
  }

  if (pathname === "/admin/analytics") {
    return [{label: "Dashboard", href: "/admin"}, {label: "Analytics"}];
  }

  if (pathname === "/admin/orders") {
    return [{label: "Dashboard", href: "/admin"}, {label: "Orders"}];
  }

  if (pathname === "/admin/orders/new" || pathname === "/admin/cart") {
    return [
      {label: "Dashboard", href: "/admin"},
      {label: "Orders", href: "/admin/orders"},
      {label: "Create Order"},
    ];
  }

  if (/^\/admin\/orders\/[^/]+$/.test(pathname)) {
    return [
      {label: "Dashboard", href: "/admin"},
      {label: "Orders", href: "/admin/orders"},
      {label: "Order Detail"},
    ];
  }

  if (/^\/admin\/products\/brand\/[^/]+$/.test(pathname)) {
    return [
      {label: "Dashboard", href: "/admin"},
      {label: "Products"},
      {label: findCatalogLabel(getLeafSegment(pathname))},
    ];
  }

  if (pathname === "/admin/products/new") {
    return [
      {label: "Dashboard", href: "/admin"},
      {label: "Products", href: "/admin/products"},
      {label: "Create Product"},
    ];
  }

  if (/^\/admin\/products\/[^/]+\/edit$/.test(pathname)) {
    return [
      {label: "Dashboard", href: "/admin"},
      {label: "Products", href: "/admin/products"},
      {label: "Edit Product"},
    ];
  }

  if (/^\/admin\/accounts\/[^/]+$/.test(pathname)) {
    return [
      {label: "Dashboard", href: "/admin"},
      {label: "Accounts"},
      {label: findAccountLabel(getLeafSegment(pathname))},
    ];
  }

  if (pathname === "/admin/brands") {
    return [{label: "Dashboard", href: "/admin"}, {label: "Brands"}];
  }

  if (/^\/admin\/brands\/[^/]+\/edit$/.test(pathname)) {
    return [
      {label: "Dashboard", href: "/admin"},
      {label: "Brands", href: "/admin/brands"},
      {label: "Edit Brand"},
    ];
  }

  if (pathname === "/admin/warehouses") {
    return [{label: "Dashboard", href: "/admin"}, {label: "Warehouses"}];
  }

  if (/^\/admin\/warehouses\/[^/]+\/edit$/.test(pathname)) {
    return [
      {label: "Dashboard", href: "/admin"},
      {label: "Warehouses", href: "/admin/warehouses"},
      {label: "Edit Warehouse"},
    ];
  }

  if (pathname === "/admin/users") {
    return [{label: "Dashboard", href: "/admin"}, {label: "Users"}];
  }

  if (/^\/admin\/users\/[^/]+\/edit$/.test(pathname)) {
    return [
      {label: "Dashboard", href: "/admin"},
      {label: "Users", href: "/admin/users"},
      {label: "Edit User"},
    ];
  }

  if (pathname === "/admin/roles") {
    return [{label: "Dashboard", href: "/admin"}, {label: "Roles"}];
  }

  if (/^\/admin\/roles\/[^/]+\/edit$/.test(pathname)) {
    return [
      {label: "Dashboard", href: "/admin"},
      {label: "Roles", href: "/admin/roles"},
      {label: "Edit Role"},
    ];
  }

  if (pathname === "/admin/imports") {
    return [{label: "Dashboard", href: "/admin"}, {label: "Imports"}];
  }

  if (pathname === "/admin/imports/sheet-calibration") {
    return [
      {label: "Dashboard", href: "/admin"},
      {label: "Imports", href: "/admin/imports"},
      {label: "Sheet Calibration"},
    ];
  }

  if (pathname === "/admin/customizer") {
    return [{label: "Dashboard", href: "/admin"}, {label: "Customizer"}];
  }

  return [{label: "Dashboard", href: "/admin"}];
}
