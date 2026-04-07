import mongoose, { Document, Schema } from "mongoose";
import { Counter } from "./Counter";

export type OrderWorkflowStatus =
  | "draft"
  | "submitted"
  | "availability_check"
  | "manager_approval"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";

export interface IOrder extends Document {
  id: number;
  orderNumber?: string;
  items: any[];
  manager_id: string | null;
  retailer_id: string;
  salesrep_id: string;
  user_id: string;
  discount_type: string;
  discount_percent: number;
  status: string;
  workflowStatus: OrderWorkflowStatus;
  note: any[];
  totalAmount: number;
  discountAmount: number;
  pricing?: any;
  participantSnapshots?: any;
  notesTimeline?: any[];
  created_at: string;
  updated_at: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    id: { type: Number, unique: true },
    orderNumber: { type: String, unique: true },
    items: { type: Schema.Types.Mixed, default: [] },
    manager_id: { type: String, default: null },
    retailer_id: { type: String, default: "" },
    salesrep_id: { type: String, default: "" },
    user_id: { type: String, default: "" },
    discount_type: { type: String, default: "none" },
    discount_percent: { type: Number, default: 0 },
    status: { type: String, default: "draft" },
    workflowStatus: { type: String, default: "draft" },
    note: { type: Schema.Types.Mixed, default: [] },
    totalAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    pricing: { type: Schema.Types.Mixed },
    participantSnapshots: { type: Schema.Types.Mixed },
    notesTimeline: { type: Schema.Types.Mixed, default: [] },
    created_at: { type: String },
    updated_at: { type: String },
  },
  { timestamps: true }
);

OrderSchema.pre("validate", async function () {
  if (this.isNew) {
    try {
      // Auto-increment logic
      const counter = await Counter.findOneAndUpdate(
        { modelName: "Order" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.id = counter.seq;
      
      if (!this.orderNumber) {
        this.orderNumber = `ORD-${String(counter.seq).padStart(6, '0')}`;
      }
      
      // Manage created_at and updated_at strings
      if (!this.created_at) this.created_at = new Date().toISOString();
      if (!this.updated_at) this.updated_at = new Date().toISOString();
    } catch (error: any) {
      throw error;
    }
  } else {
    this.updated_at = new Date().toISOString();
  }
});

// Clear the model from mongoose to ensure schema changes are applied
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

