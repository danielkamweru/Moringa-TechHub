import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchCategories = createAsyncThunk('categories/fetchCategories', async () => {
  const response = await api.get('/categories')
  return response.data
})

export const createCategory = createAsyncThunk('categories/createCategory', async (categoryData) => {
  const response = await api.post('/categories', categoryData)
  return response.data
})

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: { items: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
  },
})

export default categoriesSlice.reducer