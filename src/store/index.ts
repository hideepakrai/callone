import { configureStore } from '@reduxjs/toolkit';
import brandReducer from './slices/brandSlice/brandSlice';
import attributeReducer from './slices/attributeSlice/attributeSlice';

import travisMathewReducer from './slices/travisMathewSlice/travisMathewSlice';
import ogioReducer from './slices/ogioSlice/ogioSlice';
import hardgoodReducer from './slices/hardgoodSlice/hardgoodSlice';
import cartReducer from './slices/cart/cartSlice';
import userReducer from './slices/users/userSlice';
import orderReducer from './slices/order/OrderSlice';
import softgoodsReducer from './slices/softgoods/softgoodsSlice';
import travisSheetReducer from '@/store/slices/sheet/travismethew/TravisSheetSlice';
import warehouseReducer from '@/store/slices/wareHouse/wareHouseSlice';
export const store = configureStore({
  reducer: {
    brand: brandReducer,
    attribute: attributeReducer,
    travisMathew: travisMathewReducer,
    ogio: ogioReducer,
    hardgoods: hardgoodReducer,
    cart: cartReducer,
    user: userReducer,
    order: orderReducer,
    softgoods: softgoodsReducer,
    travisSheet: travisSheetReducer,
  warehouse:warehouseReducer,

  },
  devTools: {
    name: "CallawayOne Store"
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

