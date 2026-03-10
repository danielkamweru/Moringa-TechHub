import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { getToken, setToken, removeToken, getUserFromToken } from '../../utils/authHelpers'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://moringa-techhub.onrender.com/api'
const BASE_URL = API_BASE_URL.replace('/api', '')

// Normalize user data to ensure consistent avatar_url handling
const normalizeUser = (user) => {
  if (!user) return null
  
  return {
    ...user,
    // Always ensure avatar_url is at root level and complete
    avatar_url: user.profile?.avatar_url 
      ? (user.profile.avatar_url.startsWith('http') 
          ? user.profile.avatar_url 
          : `${BASE_URL}${user.profile.avatar_url}`)
      : user.avatar_url || null,
    // Ensure profile structure exists
    profile: {
      ...user.profile,
      avatar_url: user.profile?.avatar_url 
        ? (user.profile.avatar_url.startsWith('http') 
            ? user.profile.avatar_url 
            : `${BASE_URL}${user.profile.avatar_url}`)
        : null
    }
  }
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials)
      const { token, user } = response.data
      setToken(token)
      return { token, user }
    } catch (error) {
      // Handle different types of errors
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        return rejectWithValue('Network error: Unable to connect to the server. Please check your internet connection and try again.')
      }
      if (error.response?.status === 401) {
        return rejectWithValue('Invalid email or password. Please try again.')
      }
      if (error.response?.status === 403) {
        return rejectWithValue(error.response?.data?.detail || 'Account deactivated. Please contact administrator.')
      }
      if (error.response?.status === 429) {
        return rejectWithValue('Too many login attempts. Please try again later.')
      }
      return rejectWithValue(error.response?.data?.detail || 'Wait for backend warming up, it may take a while.')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData)
      const { token, user } = response.data
      setToken(token)
      return { token, user }
    } catch (error) {
      // Handle different types of errors
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        return rejectWithValue('Network error: Unable to connect to the server. Please check your internet connection and try again.')
      }
      if (error.response?.status === 400) {
        return rejectWithValue(error.response?.data?.detail || 'Registration failed. Please check your input.')
      }
      if (error.response?.status === 409) {
        return rejectWithValue('Email or username already exists. Please use different credentials.')
      }
      if (error.response?.status === 429) {
        return rejectWithValue('Too many registration attempts. Please try again later.')
      }
      return rejectWithValue(error.response?.data?.detail || 'Registration failed. Please try again.')
    }
  }
)

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken()
      if (!token) throw new Error('No token')
      
      const response = await api.get('/auth/me')
      return { token, user: response.data }
    } catch (error) {
      removeToken()
      return rejectWithValue('Authentication failed')
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/profile', profileData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Profile update failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      removeToken()
      state.user = null
      state.token = null
      state.isAuthenticated = false
    },
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action) => {
      console.log('DEBUG: updateUser action called with payload:', action.payload)
      const normalizedUser = normalizeUser(action.payload)
      state.user = normalizedUser
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = normalizeUser(action.payload.user)
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = normalizeUser(action.payload.user)
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(checkAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false
        state.user = normalizeUser(action.payload.user)
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = normalizeUser(action.payload)
      })
  },
})

export const { logout, clearError, updateUser } = authSlice.actions
export default authSlice.reducer