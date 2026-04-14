export type DataTableHeader = string | {
  label: React.ReactNode;
  key?: string;
  renderFilter?: (label: React.ReactNode) => React.ReactNode;
};

type DataTableProps = {
  headers: DataTableHeader[];
  children: React.ReactNode;
};

export function DataTable({headers, children}: DataTableProps) {
  return (
    <div className="overflow-clip rounded-[24px] border border-border/60 bg-[color:var(--surface)]">
      <div className="w-full max-h-[calc(100vh-250px)] overflow-auto rounded-b-[24px]">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="bg-[#111111] text-white">
              {headers.map((item, index) => {
                const label = typeof item === 'string' ? item : item.label;
                const renderFilter = typeof item === 'object' ? item.renderFilter : undefined;
                
                return (
                  <th
                    key={`${label}-${index}`}
                    className="sticky z-20 whitespace-nowrap border-b border-white/10 bg-[#111111] px-4 py-3 text-[11px] font-semibold tracking-[0.14em] text-white/82"
                    style={{top: 0}}
                  >
                    <div className="flex flex-col gap-2">
                       <span className="uppercase">{label}</span>
                       {renderFilter && (
                         <div className="mt-1 flex items-center gap-1.5 font-normal normal-case tracking-normal">
                           {renderFilter(label)}
                         </div>
                       )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 bg-[color:var(--surface)] [&_tr]:transition-colors [&_tr:hover]:bg-primary/5">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
