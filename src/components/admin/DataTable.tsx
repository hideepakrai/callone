type DataTableProps = {
  headers: string[];
  children: React.ReactNode;
};

export function DataTable({headers, children}: DataTableProps) {
  return (
    <div className="overflow-clip rounded-[24px] border border-border/60 bg-[color:var(--surface)]">
      <div className="w-full max-h-[calc(100vh-250px)] overflow-auto rounded-b-[24px]">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="bg-[#111111] text-white">
              {headers.map((header) => (
                <th
                  key={header}
                  className="sticky z-20 whitespace-nowrap border-b border-white/10 bg-[#111111] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/82"
                  style={{top: 0}}
                >
                  {header}
                </th>
              ))}
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
