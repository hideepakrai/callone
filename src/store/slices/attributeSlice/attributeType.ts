export interface AttributeField {
  key?: string;
  label?: string;
  type?: string;
  options?: any[]; // Adjust this to string[] or a specific object type if options are structured
  hint?: string;
  show?: boolean;
}

export interface AttributeType {
  _id?: string; // Mapped from MongoDB's $oid
  key?: string;
  name?: string;
  appliesTo?: string;
  contexts?: string[];
  attributes?: AttributeField[];
  isSystem?: boolean;
  source?: string;
}
