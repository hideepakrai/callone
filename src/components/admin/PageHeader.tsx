
import React from "react";
import { LucideIcon } from "lucide-react";

type PageHeaderProps = {
  title: string;
  description?: string;
  backHref?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
};

export function PageHeader({ title, description, action, icon: Icon }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 pb-8 pt-7 md:flex-row md:items-end md:justify-between">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-foreground shadow-[0_16px_30px_rgba(0,0,0,0.18)]">
            <Icon size={24} />
          </div>
        )}
        <div className="space-y-1">
          <h1 className="text-[2.3rem] font-semibold tracking-[-0.04em] text-foreground sm:text-[2.9rem]">{title}</h1>
          {description && <p className="max-w-2xl text-sm leading-6 text-foreground/62">{description}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}

     
    </div>
  );
}
