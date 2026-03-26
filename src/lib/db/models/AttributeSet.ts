import mongoose, { Schema, Document } from 'mongoose';

export interface IAttributeSet extends Document {
  key: string;
  name: string;
  appliesTo: string;
  contexts: string[];
  attributes: {
    key: string;
    label: string;
    type: string;
    options: string[];
    hint: string;
  }[];
  isSystem: boolean;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttributeSetSchema = new Schema<IAttributeSet>(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    appliesTo: { type: String, default: 'product' },
    contexts: [{ type: String }],
    attributes: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        type: { type: String, required: true },
        options: [{ type: String }],
        hint: { type: String },
      },
    ],
    isSystem: { type: Boolean, default: false },
    source: { type: String },
  },
  { timestamps: true }
);

export const AttributeSet = mongoose.models.AttributeSet || mongoose.model<IAttributeSet>('AttributeSet', AttributeSetSchema, 'attributesets');
