import { PageHeader } from "@/components/admin/PageHeader";
import AttributeHome from "@/components/setting/rightSection/attribute/AttributeHome";
import { Tag } from "lucide-react";

export default function AttributePage() {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Attributes"
          description="Manage attribute sets used across catalog filters and product sheets."
          icon={Tag}
        />
        <AttributeHome />
      </div>
    );
}
