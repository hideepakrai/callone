import { IWarehouse } from '@/components/warehouse/WareHouseType';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createWarehouse, deleteWarehouse, getAllWarehouses, updateWarehouse } from './wareHouseThunk';



interface WarehouseState {
  allWareHouse: IWarehouse[];
  currentWareHouse: IWarehouse | null;
  isFetchedWareHouse: boolean;
  isLoading: boolean; // Good practice to track loading state
  isError: string | null;
}

const initialState: WarehouseState = {
  allWareHouse: [],
  currentWareHouse: null,
  isFetchedWareHouse: false,
  isLoading: false,
  isError: null,
};

const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    // Start fetching (loading state)
    fetchWarehousesStart: (state) => {
      state.isLoading = true;
      state.isError = null;
    },
    // Set all warehouses
    setAllWarehouses: (state, action: PayloadAction<IWarehouse[]>) => {
      state.allWareHouse = action.payload;
      state.isFetchedWareHouse = true;
      state.isLoading = false;
      state.isError = null;
    },
    // Set a single warehouse (for editing or viewing details)
    setCurrentWarehouse: (state, action: PayloadAction<IWarehouse | null>) => {
      state.currentWareHouse = action.payload;
    },
    // Handle errors
    setWarehouseError: (state, action: PayloadAction<string>) => {
      state.isError = action.payload;
      state.isLoading = false;
    },
    // Reset state
    resetWarehouseState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllWarehouses.pending, (state) => {
        state.isLoading = true;
        state.isError = null;
      })
      .addCase(getAllWarehouses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allWareHouse = action.payload;
        state.isFetchedWareHouse = true;
      })
      .addCase(getAllWarehouses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload as string;
      })
      .addCase(createWarehouse.pending, (state) => {
        state.isLoading = true;
        state.isError = null;
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allWareHouse.push(action.payload);
      })
      .addCase(createWarehouse.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload as string;
      })
      .addCase(updateWarehouse.pending, (state) => {
        state.isLoading = true;
        state.isError = null;
      })
      .addCase(updateWarehouse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allWareHouse = state.allWareHouse.map((warehouse) =>
          warehouse._id === action.payload._id ? action.payload : warehouse
        );
      })
      .addCase(updateWarehouse.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload as string;
      })
      .addCase(deleteWarehouse.pending, (state) => {
        state.isLoading = true;
        state.isError = null;
      })
      .addCase(deleteWarehouse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allWareHouse = state.allWareHouse.filter(
          (warehouse) => warehouse._id !== action.payload
        );
      })
      .addCase(deleteWarehouse.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload as string;
      })
    }
});

export const { 
  fetchWarehousesStart, 
  setAllWarehouses, 
  setCurrentWarehouse, 
  setWarehouseError, 
  resetWarehouseState 
} = warehouseSlice.actions;

export default warehouseSlice.reducer;