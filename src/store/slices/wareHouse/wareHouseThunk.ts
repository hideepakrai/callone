import { IWarehouse } from '@/components/warehouse/WareHouseType';
import { createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = '/api/admin/warehouses';

/**
 * GET ALL
 */
export const getAllWarehouses = createAsyncThunk(
  'warehouse/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(BASE_URL);
      if (!response.ok) throw new Error('Failed to fetch warehouses');
      const data = await response.json();
      console.log("data warehouse----->",data);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network Error');
    }
  }
);

/**
 * CREATE
 */
export const createWarehouse = createAsyncThunk(
  'warehouse/create',
  async (newWarehouse: IWarehouse, { rejectWithValue }) => {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWarehouse),
      });
      
      const result = await response.json();
      if (!response.ok) return rejectWithValue(result.message || 'Failed to create');
      
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network Error');
    }
  }
);

/**
 * UPDATE
 */
export const updateWarehouse = createAsyncThunk(
  'warehouse/update',
  async ({ id, data }: { id: string; data: Partial<IWarehouse> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}?id=${id}`, {
        method: 'PUT', // or 'PATCH' depending on your API
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      // Rename this to 'result' to avoid conflict with the 'data' parameter above
      const result = await response.json();
      if (!response.ok) return rejectWithValue(result.message || 'Update failed');
      
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network Error');
    }
  }
);

/**
 * DELETE
 */
export const deleteWarehouse = createAsyncThunk(
  'warehouse/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const result = await response.json();
        return rejectWithValue(result.message || 'Delete failed');
      }
      
      return id; 
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network Error');
    }
  }
);