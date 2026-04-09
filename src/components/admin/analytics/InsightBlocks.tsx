import type {BreakdownItem, BrandCatalogInsight, LeaderboardItem, TrendPoint} from "@/lib/admin/insights";

function currency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function toneClasses(tone?: BreakdownItem["tone"]) {
  switch (tone) {
    case "emerald":
      return "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300";
    case "amber":
      return "bg-amber-500/12 text-amber-600 dark:text-amber-300";
    case "rose":
      return "bg-rose-500/12 text-rose-600 dark:text-rose-300";
    case "blue":
      return "bg-primary/12 text-primary";
    default:
      return "bg-foreground/8 text-foreground/72";
  }
}

export function InsightMetricCard({
  label,
  value,
  detail,
  accent,
  icon: Icon,
  image,
}: {
  label: string;
  value: string;
  detail: string;
  accent: string;
  icon?: React.ElementType;
  image?: string;
}) {
  return (
    <div className="group premium-card relative overflow-hidden rounded-[24px] p-4 transition duration-200 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(10,10,10,0.14)]">
      <div className="flex items-start justify-between">
        <div className="mb-5 h-1.5 w-16 rounded-full transition group-hover:w-24" style={{backgroundColor: accent}} />
        {(Icon || image) && (
          <div 
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl transition duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${accent}15`, color: accent }}
          >
            {image ? (
              <img src={image} alt={label} className="h-full w-full object-contain p-1.5" />
            ) : Icon ? (
              <Icon size={20} strokeWidth={2.5} />
            ) : null}
          </div>
        )}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
        {label}
      </p>
      <p className="mt-3 text-[2.15rem] font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-3 text-sm leading-6 text-foreground/58">{detail}</p>
    </div>
  );
}

export function TrendCard({
  title,
  description,
  points,
  formatter = compactNumber,
}: {
  title: string;
  description: string;
  points: TrendPoint[];
  formatter?: (value: number) => string;
}) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const stepX = points.length > 1 ? 100 / (points.length - 1) : 100;
  const linePoints = points
    .map((point, index) => `${index * stepX},${72 - (point.value / maxValue) * 62}`)
    .join(" ");
  const areaPoints = `0,72 ${linePoints} 100,72`;
  const gradientId = `trend-fill-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="premium-card rounded-[28px] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-foreground/56">{description}</p>
        </div>
        <div className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/52">
          Last {points.length} weeks
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[24px] border border-border/60 bg-[color:var(--surface-muted)] p-4">
        <svg viewBox="0 0 100 76" className="h-52 w-full">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(47,127,244,0.34)" />
              <stop offset="100%" stopColor="rgba(47,127,244,0.02)" />
            </linearGradient>
          </defs>
          <path d={`M ${areaPoints}`} fill={`url(#${gradientId})`} />
          <polyline
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={linePoints}
          />
          {points.map((point, index) => (
            <circle
              key={`${point.label}-${index}`}
              cx={index * stepX}
              cy={72 - (point.value / maxValue) * 62}
              r="1.7"
              fill="var(--primary)"
            />
          ))}
        </svg>

        <div className="mt-3 grid gap-2 md:grid-cols-4 xl:grid-cols-8">
          {points.map((point) => (
            <div key={point.label} className="rounded-2xl border border-border/60 bg-background px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/42">
                {point.label}
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">{formatter(point.value)}</p>
              {point.count != null ? (
                <p className="mt-1 text-xs text-foreground/48">{point.count} orders</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BreakdownCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: BreakdownItem[];
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="premium-card rounded-[28px] p-5">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-foreground/56">{description}</p>

      <div className="mt-5 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.label} className="rounded-[22px] border border-border/60 bg-[color:var(--surface-muted)] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold capitalize text-foreground">{item.label}</p>
                  {item.helper ? (
                    <p className="mt-1 text-xs text-foreground/48">{item.helper}</p>
                  ) : null}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${toneClasses(item.tone)}`}>
                  {item.value}
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-foreground/8">
                <div
                  className={`h-2 rounded-full ${item.tone === "emerald" ? "bg-emerald-500" : item.tone === "amber" ? "bg-amber-500" : item.tone === "rose" ? "bg-rose-500" : item.tone === "blue" ? "bg-primary" : "bg-[color:var(--surface-strong)]"}`}
                  style={{width: `${(item.value / maxValue) * 100}%`}}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-border/70 bg-[color:var(--surface-muted)] px-4 py-6 text-sm text-foreground/52">
            No activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}

export function LeaderboardCard({
  title,
  description,
  items,
  valuePrefix = "",
  showCurrency = false,
}: {
  title: string;
  description: string;
  items: LeaderboardItem[];
  valuePrefix?: string;
  showCurrency?: boolean;
}) {
  return (
    <div className="premium-card rounded-[28px] p-5">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-foreground/56">{description}</p>

      <div className="mt-5 space-y-3">
        {items.length ? (
          items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="rounded-[22px] border border-border/60 bg-[color:var(--surface-muted)] px-4 py-3 transition hover:border-primary/20 hover:bg-primary/10">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="mt-1 text-xs text-foreground/48">{item.sublabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {showCurrency ? currency(item.value) : `${valuePrefix}${compactNumber(item.value)}`}
                  </p>
                  {item.secondary != null ? (
                    <p className="mt-1 text-xs text-foreground/48">{currency(item.secondary)}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-border/70 bg-[color:var(--surface-muted)] px-4 py-6 text-sm text-foreground/52">
            No ranked data available yet.
          </div>
        )}
      </div>
    </div>
  );
}

export function BrandCatalogCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: BrandCatalogInsight[];
}) {
  return (
    <div className="premium-card rounded-[28px] p-5">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-foreground/56">{description}</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.label} className="rounded-[22px] border border-border/60 bg-[color:var(--surface-muted)] p-4 transition hover:-translate-y-1 hover:border-primary/20">
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-semibold text-foreground">{item.products}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-foreground/45">Products</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">{item.variants}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-foreground/45">Variants</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">{item.stock}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-foreground/45">Stock</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-border/70 bg-[color:var(--surface-muted)] px-4 py-6 text-sm text-foreground/52">
            No catalog groups available yet.
          </div>
        )}
      </div>
    </div>
  );
}
