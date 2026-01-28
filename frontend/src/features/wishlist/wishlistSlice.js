import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async () => {
  const response = await api.get('/wishlist')
  return response.data
})

export const toggleWishlist = createAsyncThunk('wishlist/toggleWishlist', async (content) => {
  const response = await api.post(`/wishlist/${content.id}`)
  return { content, action: response.data.action }
})

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { content, action: wishlistAction } = action.payload
        if (wishlistAction === 'added') {
          state.items.push(content)
        } else {
          state.items = state.items.filter(item => item.id !== content.id)
        }
      })
  },
})

export default wishlistSlice.reducer