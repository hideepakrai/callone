import { CartItem } from "../cart/cartSlice";

export interface NoteModel{
  message?: string;
  name?: string;
  date?: string;
  user_id?: string;
  access?: string;
  type?: string;
  }
export interface OrderModel {
  _id?: string,
  id?: number,
  items?: CartItem[],
   manager_id?: string | null,
  retailer_id?: string,
  salesrep_id?: string,
    user_id?: string,
  discount_type?: string,
  discount_percent?: number,
  status?: string,
  orderNumber?: string,
  created_at?: string;
  note?: NoteModel[];
  totalAmount?: number,
  discountAmount?: number,

  updated_at?: string;
}

export interface OrderState {
  allOrders: OrderModel[];
  currentOrder: OrderModel | null;
  isFetchedOrders: boolean;
  isLoadingOrders: boolean;
  isError: boolean;
  error: string | null;
}