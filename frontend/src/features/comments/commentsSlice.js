import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchComments = createAsyncThunk('comments/fetchComments', async (contentId) => {
  const response = await api.get(`/content/${contentId}/comments`)
  return response.data
})

export const addComment = createAsyncThunk('comments/addComment', async ({ contentId, text, parentId }) => {
  const response = await api.post(`/content/${contentId}/comments`, { text, parentId })
  return response.data
})

export const likeComment = createAsyncThunk('comments/likeComment', async (commentId) => {
  const response = await api.post(`/comments/${commentId}/like`)
  return response.data
})

export const reportComment = createAsyncThunk('comments/reportComment', async (commentId) => {
  const response = await api.post(`/comments/${commentId}/report`)
  return response.data
})

const commentsSlice = createSlice({
  name: 'comments',
  initialState: { items: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
  },
})

export default commentsSlice.reducer