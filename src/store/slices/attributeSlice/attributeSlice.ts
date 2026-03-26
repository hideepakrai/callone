import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AttributeType } from './attributeType';
import { fetchAttributes, fetchAttributeById, createAttribute, updateAttribute, deleteAttribute } from './attributeThunks';

export interface AttributeState {
  allAttribute: AttributeType[];
  currentAttribute: AttributeType | null;
  isFetchedAttribute: boolean;
  error: string | null;
}

const initialState: AttributeState = {
  allAttribute: [],
  currentAttribute: null,
  isFetchedAttribute: false,
  error: null,
};

export const attributeSlice = createSlice({
  name: 'attribute',
  initialState,
  reducers: {
    setAllAttribute: (state, action: PayloadAction<AttributeType[]>) => {
      state.allAttribute = action.payload;
    },
    setCurrentAttribute: (state, action: PayloadAction<AttributeType | null>) => {
      state.currentAttribute = action.payload;
    },
    setIsFetchedAttribute: (state, action: PayloadAction<boolean>) => {
      state.isFetchedAttribute = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchAttributes
    builder.addCase(fetchAttributes.pending, (state) => {
      state.isFetchedAttribute = false;
      state.error = null;
    });
    builder.addCase(fetchAttributes.fulfilled, (state, action) => {
      state.isFetchedAttribute = true;
      state.allAttribute = action.payload;
    });
    builder.addCase(fetchAttributes.rejected, (state, action) => {
      state.isFetchedAttribute = false;
      state.error = action.payload as string;
    });

    // fetchAttributeById
    builder.addCase(fetchAttributeById.pending, (state) => {
      state.error = null;
    });
    builder.addCase(fetchAttributeById.fulfilled, (state, action) => {
      state.currentAttribute = action.payload;
    });
    builder.addCase(fetchAttributeById.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // createAttribute
    builder.addCase(createAttribute.fulfilled, (state, action) => {
      state.allAttribute.push(action.payload);
    });
    builder.addCase(createAttribute.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // updateAttribute
    builder.addCase(updateAttribute.fulfilled, (state, action) => {
      const index = state.allAttribute.findIndex(a => a._id === action.payload._id);
      if (index !== -1) {
        state.allAttribute[index] = action.payload;
      }
      if (state.currentAttribute?._id === action.payload._id) {
        state.currentAttribute = action.payload;
      }
    });
    builder.addCase(updateAttribute.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // deleteAttribute
    builder.addCase(deleteAttribute.fulfilled, (state, action) => {
      state.allAttribute = state.allAttribute.filter(a => a._id !== action.payload);
      if (state.currentAttribute?._id === action.payload) {
        state.currentAttribute = null;
      }
    });
    builder.addCase(deleteAttribute.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const { setAllAttribute, setCurrentAttribute, setIsFetchedAttribute, setError } = attributeSlice.actions;

export default attributeSlice.reducer;
