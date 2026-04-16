import mongoose, { Document, Schema } from "mongoose";

// Interface for the sub-document
export interface IBrand {
  _id?: string;
  name?: string;
  key?: string;
  isActive?: boolean;
}

// Interface for the Warehouse Document
export interface IWarehouse extends Document {
  code: string;
  name: string;
  location?: string;
  priority: number;
  isActive: boolean;
  isDefault: boolean; // Retained from your previous logic
  brands: IBrand[];
  createdAt: Date;
  updatedAt: Date;
}

// Sub-schema for Brands
const BrandSchema = new Schema<IBrand>({
  name: { type: String, trim: true },
  key: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
});

const WarehouseSchema = new Schema<IWarehouse>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, default: "" },
    priority: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    // Array of Brand sub-documents
    brands: [BrandSchema],
  },
  { timestamps: true }
);

export const Warehouse =
  mongoose.models.Warehouse ||
  mongoose.model<IWarehouse>("Warehouse", WarehouseSchema);