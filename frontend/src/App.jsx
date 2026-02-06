import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AppRoutes from './routes/AppRoutes'
import { checkAuth } from './features/auth/authSlice'
import { fetchUserLikes } from './features/content/contentSlice'
import { fetchWishlist } from './features/wishlist/wishlistSlice'
import { fetchUnreadCount } from './features/notifications/notificationsSlice'
import { fetchUserSubscriptions } from './features/categories/categoriesSlice'

function AppContent() {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const location = useLocation()

  // Restore auth state on app load
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      dispatch(checkAuth())
    }
  }, [dispatch])

  // Redirect to appropriate dashboard if authenticated and on wrong path
  useEffect(() => {
    if (isAuthenticated && user) {
      const currentPath = location.pathname
      
      // Don't redirect if already on correct dashboard or public pages
      const publicPaths = ['/login', '/register', '/']
      const adminPaths = currentPath.startsWith('/admin')
      const techWriterPaths = currentPath.startsWith('/tech-writer')
      const userPaths = currentPath.startsWith('/user')
      
      if (!publicPaths.includes(currentPath) && !adminPaths && !techWriterPaths && !userPaths) {
        // User is on a content page or other, don't redirect
        return
      }
      
      // Redirect to correct dashboard if on wrong one
      if (user.role === 'admin' && !adminPaths) {
        window.location.href = '/admin'
      } else if (user.role === 'tech_writer' && !techWriterPaths) {
        window.location.href = '/tech-writer'
      } else if (user.role === 'user' && !userPaths && !publicPaths.includes(currentPath)) {
        window.location.href = '/user'
      }
    }
  }, [isAuthenticated, user, location])

  // Load user data only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Parallel loading for better performance
      Promise.all([
        dispatch(fetchUserLikes()),
        dispatch(fetchWishlist()),
        dispatch(fetchUnreadCount()),
        dispatch(fetchUserSubscriptions())
      ]).catch(error => {
        console.error('Failed to load user data:', error)
      })
    }
  }, [dispatch, isAuthenticated])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <Navbar />
      </div>
      
      {/* Mobile Navigation - Navbar handles both desktop and mobile */}
      <div className="lg:hidden">
        <Navbar />
      </div>
      
      {/* Main Content */}
      <main className={`${isAuthenticated ? 'lg:pt-0 pt-16 lg:pb-0 pb-16' : ''}`}>
        <AppRoutes />
      </main>
      
      {/* Desktop Footer */}
      <div className="hidden lg:block">
        <Footer />
      </div>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </BrowserRouter>
  )
}

export default App