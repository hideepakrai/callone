import { createAsyncThunk } from '@reduxjs/toolkit';
import { UserInterface } from './userSlice';

const API_URL = '/api/admin/users';

export const fetchUsersByRole = createAsyncThunk<
  { role: string; users: UserInterface[] },
  string,
  { rejectValue: string }
>(
  'user/fetchByRole',
  async (role, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}?role=${role}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch users for role: ${role}`);
      }
      const data = await response.json();
      return { role, users: data.data as UserInterface[] };
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching users');
    }
  }
);
export const createUser = createAsyncThunk<
  UserInterface,
  any,
  { rejectValue: string }
>(
  'user/create',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create user');
      return data.user as UserInterface;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while creating user');
    }
  }
);

export const updateUser = createAsyncThunk<
  UserInterface,
  any,
  { rejectValue: string }
>(
  'user/update',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update user');
      return data.user as UserInterface;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while updating user');
    }
  }
);

export const deleteUserThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'user/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete user');
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while deleting user');
    }
  }
);
