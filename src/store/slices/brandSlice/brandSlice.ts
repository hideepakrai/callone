import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BrandType } from './brandType';
import { fetchBrands, fetchBrandById, createBrand, updateBrand, deleteBrand } from './brandThunks';

export interface BrandState {
  allBrand: BrandType[];
  currentBrand: BrandType | null;
  isFetchedBrand: boolean;
  error: string | null;
}

const initialState: BrandState = {
  allBrand: [],
  currentBrand: null,
  isFetchedBrand: false,
  error: null,
};

export const brandSlice = createSlice({
  name: 'brand',
  initialState,
  reducers: {
    setAllBrand: (state, action: PayloadAction<BrandType[]>) => {
      state.allBrand = action.payload;
    },
    setCurrentBrand: (state, action: PayloadAction<BrandType | null>) => {
      state.currentBrand = action.payload;
    },
    setIsFetchedBrand: (state, action: PayloadAction<boolean>) => {
      state.isFetchedBrand = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchBrands
    builder.addCase(fetchBrands.pending, (state) => {
      state.isFetchedBrand = false;
      state.error = null;
    });
    builder.addCase(fetchBrands.fulfilled, (state, action) => {
      state.isFetchedBrand = true;
      state.allBrand = action.payload;
    });
    builder.addCase(fetchBrands.rejected, (state, action) => {
      state.isFetchedBrand = false;
      state.error = action.payload as string;
    });

    // fetchBrandById
    builder.addCase(fetchBrandById.pending, (state) => {
      state.error = null;
    });
    builder.addCase(fetchBrandById.fulfilled, (state, action) => {
      state.currentBrand = action.payload;
    });
    builder.addCase(fetchBrandById.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // createBrand
    builder.addCase(createBrand.fulfilled, (state, action) => {
      state.allBrand.push(action.payload);
    });
    builder.addCase(createBrand.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // updateBrand
    builder.addCase(updateBrand.fulfilled, (state, action) => {
      const index = state.allBrand.findIndex(b => b._id === action.payload._id);
      if (index !== -1) {
        state.allBrand[index] = action.payload;
      }
      if (state.currentBrand?._id === action.payload._id) {
        state.currentBrand = action.payload;
      }
    });
    builder.addCase(updateBrand.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // deleteBrand
    builder.addCase(deleteBrand.fulfilled, (state, action) => {
      state.allBrand = state.allBrand.filter(b => b._id !== action.payload);
      if (state.currentBrand?._id === action.payload) {
        state.currentBrand = null;
      }
    });
    builder.addCase(deleteBrand.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const { setAllBrand, setCurrentBrand, setIsFetchedBrand, setError } = brandSlice.actions;

export default brandSlice.reducer;
