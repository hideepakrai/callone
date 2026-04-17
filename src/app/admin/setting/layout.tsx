import NavItemsection from "@/components/setting/leftSection/NavItemsection";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="premium-card overflow-hidden rounded-[28px]">
        <div className="border-b border-border/10 px-6 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-foreground/42">
            Settings
          </p>
        </div>
        <div className="p-3">
          <NavItemsection />
        </div>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
