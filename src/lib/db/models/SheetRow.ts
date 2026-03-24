import mongoose, {Document, Schema} from "mongoose";

export interface ISheetRow extends Document {
  datasetId: mongoose.Types.ObjectId;
  rowIndex: number;
  data: Record<string, unknown>;
  relation: {
    status: "matched" | "partial" | "unmatched";
    brandId?: mongoose.Types.ObjectId | null;
    brandLabel?: string;
    productId?: mongoose.Types.ObjectId | null;
    productLabel?: string;
    variantId?: mongoose.Types.ObjectId | null;
    variantLabel?: string;
    warehouseId?: mongoose.Types.ObjectId | null;
    warehouseLabel?: string;
    issues: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const SheetRowSchema = new Schema<ISheetRow>(
  {
    datasetId: {type: Schema.Types.ObjectId, ref: "SheetDataset", required: true, index: true},
    rowIndex: {type: Number, required: true},
    data: {type: Schema.Types.Mixed, required: true},
    relation: {
      status: {
        type: String,
        enum: ["matched", "partial", "unmatched"],
        default: "unmatched",
      },
      brandId: {type: Schema.Types.ObjectId, ref: "Brand", default: null},
      brandLabel: {type: String, default: ""},
      productId: {type: Schema.Types.ObjectId, ref: "Product", default: null},
      productLabel: {type: String, default: ""},
      variantId: {type: Schema.Types.ObjectId, ref: "Variant", default: null},
      variantLabel: {type: String, default: ""},
      warehouseId: {type: Schema.Types.ObjectId, ref: "Warehouse", default: null},
      warehouseLabel: {type: String, default: ""},
      issues: [{type: String}],
    },
  },
  {timestamps: true}
);

SheetRowSchema.index({datasetId: 1, rowIndex: 1}, {unique: true});

export const SheetRow =
  mongoose.models.SheetRow ||
  mongoose.model<ISheetRow>("SheetRow", SheetRowSchema);
