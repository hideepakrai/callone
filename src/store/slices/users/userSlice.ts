import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchUsersByRole, createUser, updateUser, deleteUserThunk } from './userThunks';

export interface UserInterface {
  _id?: string;
  id?: number | string;
  email?: string;
  token?: string;
  phone?: string | number;
  name?: string;
  role?: string;

  code?: string | number;
  manager_id?: number | string;
  managerId?: string;
  designation?: string;
  status?: string;
  permissions?: string[];
  password_hash?: string;
  gstin?: string;
  address?: string;
  new_hash_password?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserState {
  user: UserInterface | null;
  allManager: UserInterface[];
  isFetchedAllManager: boolean;
  allRetailer: UserInterface[];
  isFetchedAllRetailer: boolean;
  allSaleRep: UserInterface[];
  isFetchedAllSaleRep: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  allManager: [],
  isFetchedAllManager: false,
  allRetailer: [],
  isFetchedAllRetailer: false,
  allSaleRep: [],
  isFetchedAllSaleRep: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserInterface | null>) {
      state.user = action.payload;
    },
    setAllManagers(state, action: PayloadAction<UserInterface[]>) {
      state.allManager = action.payload;
    },
    setAllRetailers(state, action: PayloadAction<UserInterface[]>) {
      state.allRetailer = action.payload;
    },
    setAllSaleReps(state, action: PayloadAction<UserInterface[]>) {
      state.allSaleRep = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearUserData(state) {
      state.user = null;
      state.allManager = [];
      state.allRetailer = [];
      state.allSaleRep = [];
    },
    addManager(state, action: PayloadAction<UserInterface>) {
      state.allManager.unshift(action.payload);
    },
    addRetailer(state, action: PayloadAction<UserInterface>) {
      state.allRetailer.unshift(action.payload);
    },
    addSaleRep(state, action: PayloadAction<UserInterface>) {
      state.allSaleRep.unshift(action.payload);
    },
    removeUser(state, action: PayloadAction<{ id: string; role: string }>) {
      const { id, role } = action.payload;
      const filterList = (list: UserInterface[]) => list.filter(u => u._id !== id && (u.id as any) != id);

      if (role?.toLowerCase() === 'manager') {
        state.allManager = filterList(state.allManager);
      } else if (role?.toLowerCase() === 'retailer') {
        state.allRetailer = filterList(state.allRetailer);
      } else if (role?.toLowerCase() === 'sales_rep' || role?.toLowerCase() === 'sales representative') {
        state.allSaleRep = filterList(state.allSaleRep);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersByRole.fulfilled, (state, action) => {
        state.loading = false;
        const { role, users } = action.payload;
        
        switch (role) {
          case 'manager':
            state.allManager = users;
            state.isFetchedAllManager = true;
            break;
          case 'retailer':
            state.allRetailer = users;
            state.isFetchedAllRetailer = true;
            break;
          case 'sales_rep':
            state.allSaleRep = users;
            state.isFetchedAllSaleRep = true;
            break;
          default:
            break;
        }
      })
      .addCase(fetchUsersByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch users';
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        const newUser = action.payload;
        if (newUser.role) {
          switch (newUser.role) {
            case 'manager':
              state.allManager.unshift(newUser);
              break;
            case 'retailer':
              state.allRetailer.unshift(newUser);
              break;
            case 'sales_rep':
              state.allSaleRep.unshift(newUser);
              break;
          }
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create user';
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload;
        const updateInList = (list: UserInterface[]) => {
          const index = list.findIndex(u => (u._id === updatedUser._id) || (u.id === updatedUser.id));
          if (index !== -1) {
            list[index] = updatedUser;
          }
        };

        if (updatedUser.role) {
          switch (updatedUser.role) {
            case 'manager':
              updateInList(state.allManager);
              break;
            case 'retailer':
              updateInList(state.allRetailer);
              break;
            case 'sales_rep':
              updateInList(state.allSaleRep);
              break;
          }
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update user';
      })
      // Delete User
      .addCase(deleteUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        const filterList = (list: UserInterface[]) => list.filter(u => u._id !== id && (u.id as any) != id);
        state.allManager = filterList(state.allManager);
        state.allRetailer = filterList(state.allRetailer);
        state.allSaleRep = filterList(state.allSaleRep);
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete user';
      });
  },
});

export const {
  setUser,
  setAllManagers,
  setAllRetailers,
  setAllSaleReps,
  setLoading,
  setError,
  clearUserData,
  addManager,
  addRetailer,
  addSaleRep,
  removeUser,
} = userSlice.actions;

export default userSlice.reducer;
