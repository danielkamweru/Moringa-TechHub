import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://moringa-techhub.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased timeout to 30 seconds for backend wake-up
  withCredentials: true,
})

// Keep-alive mechanism to prevent backend from sleeping
let keepAliveInterval = null

const startKeepAlive = () => {
  if (keepAliveInterval) clearInterval(keepAliveInterval)
  
  // Ping the backend every 14 minutes (Render sleeps after 15 minutes of inactivity)
  keepAliveInterval = setInterval(async () => {
    try {
      await api.get('/ping')
      console.log('Backend keep-alive ping successful')
    } catch (error) {
      console.log('Keep-alive ping failed:', error.message)
    }
  }, 14 * 60 * 1000) // 14 minutes
}

const stopKeepAlive = () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval)
    keepAliveInterval = null
  }
}

// Start keep-alive when user is active
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    startKeepAlive()
  } else {
    stopKeepAlive()
  }
})

// Start keep-alive on page load
startKeepAlive()

// Add retry logic for failed requests
const retryRequest = async (config, retryCount = 0) => {
  const maxRetries = 3
  const retryDelay = 2000 // 2 seconds
  
  try {
    return await api(config)
  } catch (error) {
    if (retryCount < maxRetries && 
        (error.code === 'ECONNABORTED' || 
         error.message.includes('timeout') || 
         error.response?.status >= 500)) {
      
      console.log(`Retrying request (attempt ${retryCount + 1}/${maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, retryDelay))
      return retryRequest(config, retryCount + 1)
    }
    throw error
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // If the error is a timeout or server error, retry once
    if ((error.code === 'ECONNABORTED' || 
         error.message.includes('timeout') || 
         error.response?.status >= 500) && 
        !originalRequest._retry) {
      
      originalRequest._retry = true
      
      try {
        console.log('Backend might be waking up, retrying request...')
        await new Promise(resolve => setTimeout(resolve, 3000)) // Wait 3 seconds
        return await api(originalRequest)
      } catch (retryError) {
        console.error('Retry failed:', retryError)
      }
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    // Enhanced error messages
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. The backend might be waking up. Please try again.'
    } else if (error.response?.status >= 500) {
      error.message = 'Server error. The backend is starting up. Please wait a moment and try again.'
    }
    
    return Promise.reject(error)
  }
)

// Export both the regular api and the retry-enabled version
export default api
export { retryRequest, startKeepAlive, stopKeepAlive }