import React from "react";
import ProductHeader from "../header/ProductHeader";

export interface HardgoodHeaderProps {
  totalCount: number;
  onImport: () => void;
  onExportVisible: () => void;
}

export function HardgoodHeader({totalCount, onImport, onExportVisible}: HardgoodHeaderProps) {
  return (
    <ProductHeader
      title="Callaway Hardgoods"
      description="Equipment, clubs, and hardgoods from the Callaway lineup."
      totalCount={totalCount}
      onImport={onImport}
      onExportVisible={onExportVisible}
    />
  );
}
