import React from "react";
import ProductHeader from "../header/ProductHeader";

export interface OgioHeaderProps {
  totalCount: number;
  onImport: () => void;
  onExportVisible: () => void;
}

export function OgioHeader({totalCount, onImport, onExportVisible}: OgioHeaderProps) {
  return (
    <ProductHeader
      title="Ogio"
      description="Bags, backpacks, and travel gear from Ogio."
      totalCount={totalCount}
      onImport={onImport}
      onExportVisible={onExportVisible}
    />
  );
}
