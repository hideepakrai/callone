import { createAsyncThunk } from '@reduxjs/toolkit';
import { BrandType } from './brandType';

const API_URL = '/api/admin/brand';

export const fetchBrands = createAsyncThunk<BrandType[], void, { rejectValue: string }>(
  'brand/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch brands');
      const data = await response.json();
      return data.data as BrandType[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching brands');
    }
  }
);

export const fetchBrandById = createAsyncThunk<BrandType, string, { rejectValue: string }>(
  'brand/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch brand');
      const data = await response.json();
      return data as BrandType;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching the brand');
    }
  }
);

export const createBrand = createAsyncThunk<BrandType, Partial<BrandType>, { rejectValue: string }>(
  'brand/create',
  async (brandData, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData),
      });
      if (!response.ok) throw new Error('Failed to create brand');
      const data = await response.json();
      return data as BrandType;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while creating the brand');
    }
  }
);

export const updateBrand = createAsyncThunk<BrandType, { id: string; data: Partial<BrandType> }, { rejectValue: string }>(
  'brand/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update brand');
      const responseData = await response.json();
      return responseData as BrandType;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while updating the brand');
    }
  }
);

export const deleteBrand = createAsyncThunk<string, string, { rejectValue: string }>(
  'brand/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete brand');
      return id; // Return the deleted id so we can remove it from state
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while deleting the brand');
    }
  }
);
