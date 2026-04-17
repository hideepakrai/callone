"use client"

import { Users, Tag, Layers, Warehouse } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
    { key: "users", label: "Users", icon: Users , href: "/admin/setting/users"},
    { key: "attributes", label: "Attributes", icon: Tag , href: "/admin/setting/attribute"},
    { key: "brands", label: "Brands", icon: Layers , href: "/admin/setting/brands"},
    { key: "warehouse", label: "Warehouse", icon: Warehouse , href: "/admin/setting/warehouse"},
];

const NavItemsection = () => {
    const pathname = usePathname();
    return (
        <nav className="space-y-1">
            {navItems.map(({ key, label, icon: Icon, href }) => {
                const isActive = pathname === href || pathname.startsWith(`${href}/`);

                return (
                    <Link
                        key={key}
                        href={href}
                        className={clsx(
                            "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                            isActive
                                ? "bg-foreground text-background shadow-[0_18px_40px_rgba(0,0,0,0.14)]"
                                : "text-foreground/62 hover:bg-foreground/[0.04] hover:text-foreground"
                        )}
                    >
                        <Icon size={16} strokeWidth={1.8} className={clsx(isActive ? "text-background" : "text-foreground/60")} />
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
};

export default NavItemsection;
