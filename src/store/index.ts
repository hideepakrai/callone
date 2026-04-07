import { configureStore } from '@reduxjs/toolkit';
import brandReducer from './slices/brandSlice/brandSlice';
import attributeReducer from './slices/attributeSlice/attributeSlice';

import travisMathewReducer from './slices/travisMathewSlice/travisMathewSlice';
import ogioReducer from './slices/ogioSlice/ogioSlice';
import hardgoodReducer from './slices/hardgoodSlice/hardgoodSlice';
import cartReducer from './slices/cart/cartSlice';
import userReducer from './slices/users/userSlice';
import orderReducer from './slices/order/OrderSlice';
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
  },
  devTools: {
    name: "CallawayOne Store"
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

