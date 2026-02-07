import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { getToken, setToken, removeToken, getUserFromToken } from '../../utils/authHelpers'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://moringa-techhub.onrender.com/api'
const BASE_URL = API_BASE_URL.replace('/api', '')

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Login attempt with credentials:', credentials)
      const response = await api.post('/auth/login', credentials)
      console.log('Login response:', response.data)
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
      return rejectWithValue(error.response?.data?.detail || 'Login failed. Please try again.')
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
      state.user = action.payload
      
      // Set user.avatar_url directly from profile.avatar_url if available
      if (action.payload?.profile?.avatar_url) {
        console.log('DEBUG: Found avatar_url in profile:', action.payload.profile.avatar_url)
        const avatarUrl = action.payload.profile.avatar_url.startsWith('http')
          ? action.payload.profile.avatar_url
          : `${BASE_URL}${action.payload.profile.avatar_url}`
        
        // Set both user.avatar_url and user.profile.avatar_url
        state.user.avatar_url = avatarUrl
        if (state.user.profile) {
          state.user.profile.avatar_url = avatarUrl
        }
      } else {
        console.log('DEBUG: No avatar_url found in profile')
      }
      
      // Also update bio if present in profile
      if (action.payload?.profile?.bio !== undefined) {
        console.log('DEBUG: Found bio in profile:', action.payload.profile.bio)
        if (state.user.profile) {
          state.user.profile.bio = action.payload.profile.bio
        }
      } else {
        console.log('DEBUG: No bio found in profile')
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        // Ensure avatar_url is properly set from profile if available
        if (action.payload.user?.profile?.avatar_url && !action.payload.user.avatar_url) {
          state.user.avatar_url = action.payload.user.profile.avatar_url.startsWith('http')
            ? action.payload.user.profile.avatar_url
            : `${BASE_URL}${action.payload.user.profile.avatar_url}`
        }
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
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        // Ensure avatar_url is properly set from profile if available
        if (action.payload.user?.profile?.avatar_url && !action.payload.user.avatar_url) {
          state.user.avatar_url = action.payload.user.profile.avatar_url.startsWith('http')
            ? action.payload.user.profile.avatar_url
            : `${BASE_URL}${action.payload.user.profile.avatar_url}`
        }
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
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        // Ensure avatar_url is properly set in profile if available
        if (action.payload.user?.profile?.avatar_url) {
          const avatarUrl = action.payload.user.profile.avatar_url.startsWith('http')
            ? action.payload.user.profile.avatar_url
            : `${BASE_URL}${action.payload.user.profile.avatar_url}`
          // Update the profile avatar_url with full URL
          if (state.user.profile) {
            state.user.profile.avatar_url = avatarUrl
          }
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload
        // Ensure avatar_url is properly set from response
        // Priority 1: Check direct avatar_url on response (MAIN RESPONSE)
        if (action.payload?.profile?.avatar_url) {
          console.log('Setting avatar_url from profile response:', action.payload.profile.avatar_url)
          const avatarUrl = action.payload.profile.avatar_url.startsWith('http')
            ? action.payload.profile.avatar_url
            : `${BASE_URL}${action.payload.profile.avatar_url}`
          // Update the profile avatar_url with full URL
          if (state.user.profile) {
            state.user.profile.avatar_url = avatarUrl
          }
        }
        // Also update bio if present in profile
        if (action.payload?.profile?.bio !== undefined) {
          console.log('Setting bio from profile response:', action.payload.profile.bio)
          if (state.user.profile) {
            state.user.profile.bio = action.payload.profile.bio
          }
        }
      })
  },
})

export const { logout, clearError, updateUser } = authSlice.actions
export default authSlice.reducer