import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await api.get('/users')
  return response.data
})

export const updateUserProfile = createAsyncThunk('users/updateProfile', async (userData) => {
  const response = await api.put('/users/profile', userData)
  return response.data
})

const usersSlice = createSlice({
  name: 'users',
  initialState: { items: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        const index = state.items.findIndex(user => user.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
      })
  },
})

export default usersSlice.reducer