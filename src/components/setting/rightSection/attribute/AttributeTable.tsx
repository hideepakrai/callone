"use client";

import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { SectionCard } from "@/components/admin/SectionCard";
import { DataTable } from "@/components/admin/DataTable";

const AttributeTable = () => {
  const { allAttribute } = useSelector((state: RootState) => state.attribute);

  const handleEdit = (item: any) => {
    console.log("Edit:", item);
  };

  const handleDelete = (id?: string) => {
    console.log("Delete:", id);
  };

  return (
    <SectionCard
      title="Attribute sets"
      description="Configure which attributes appear across products and worksheets."
    >
      <DataTable
        headers={[
          "Name",
          "Key",
          "Applies to",
          "Contexts",
          "Attributes",
          "Source",
          "System",
          "Actions",
        ]}
      >
        {allAttribute?.length > 0 ? (
          allAttribute.map((item: any) => (
            <tr key={String(item._id ?? item.key ?? item.name)}>
              <td className="px-4 py-4 text-sm font-semibold text-foreground">{item.name || "-"}</td>
              <td className="px-4 py-4 text-sm text-foreground/70">{item.key || "-"}</td>
              <td className="px-4 py-4 text-sm text-foreground/70">{item.appliesTo || "-"}</td>
              <td className="px-4 py-4 text-sm text-foreground/70">
                {item.contexts?.length ? item.contexts.join(", ") : "-"}
              </td>
              <td className="px-4 py-4 text-sm text-foreground/70">{item.attributes?.length || 0}</td>
              <td className="px-4 py-4 text-sm text-foreground/70">{item.source || "-"}</td>
              <td className="px-4 py-4 text-sm text-foreground/70">{item.isSystem ? "Yes" : "No"}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="text-sm font-semibold text-primary"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="text-sm font-semibold text-danger"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={8} className="px-6 py-14 text-center text-sm text-foreground/60">
              No data available
            </td>
          </tr>
        )}
      </DataTable>
    </SectionCard>
  );
};

export default AttributeTable;
