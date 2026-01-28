import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchNotifications = createAsyncThunk('notifications/fetchNotifications', async () => {
  const response = await api.get('/notifications')
  return response.data
})

export const markAsRead = createAsyncThunk('notifications/markAsRead', async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`)
  return response.data
})

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0, loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload
        state.unreadCount = action.payload.filter(n => !n.isRead).length
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.items.find(n => n.id === action.payload.id)
        if (notification && !notification.isRead) {
          notification.isRead = true
          state.unreadCount -= 1
        }
      })
  },
})

export default notificationsSlice.reducer