import { Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import RoleGuard from '../utils/roleGuard.jsx'

// Pages
import Home from '../pages/Home'
import RoleSelection from '../pages/RoleSelection'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Profile from '../pages/Profile'
import ContentView from '../pages/ContentView'
import Wishlist from '../pages/Wishlist'
import AdminDashboard from '../pages/AdminDashboard'
import WriterDashboard from '../pages/WriterDashboard'

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/content/:id" element={<ContentView />} />
          
          {/* Protected Routes */}
          <Route 
            path="/profile" 
            element={<RoleGuard><Profile /></RoleGuard>} 
          />
          <Route 
            path="/wishlist" 
            element={<RoleGuard><Wishlist /></RoleGuard>} 
          />
          
          {/* Admin Only Routes */}
          <Route 
            path="/admin" 
            element={<RoleGuard allowedRoles={['admin']}><AdminDashboard /></RoleGuard>} 
          />
          
          {/* Writer Routes */}
          <Route 
            path="/writer" 
            element={<RoleGuard allowedRoles={['writer', 'admin']}><WriterDashboard /></RoleGuard>} 
          />
          
          {/* 404 Route */}
          <Route 
            path="*" 
            element={
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-4">Page not found</p>
                  <a href="/" className="btn-primary">Go Home</a>
                </div>
              </div>
            } 
          />
        </Routes>
      </main>
      
      <Footer />
    </div>
  )
}

export default AppRoutes