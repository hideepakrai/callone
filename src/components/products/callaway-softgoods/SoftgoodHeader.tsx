import React from "react";
import ProductHeader from "../header/ProductHeader";

export interface SoftgoodHeaderProps {
  totalCount: number;
  onImport: () => void;
  onExportVisible: () => void;
}

export function SoftgoodHeader({totalCount, onImport, onExportVisible}: SoftgoodHeaderProps) {
  return (
    <ProductHeader
      title="Callaway Softgoods"
      description="Apparel, accessories, and softgoods from the Callaway range."
      totalCount={totalCount}
      onImport={onImport}
      onExportVisible={onExportVisible}
    />
  );
}
