import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import Loader from '../components/Loader'

const RoleGuard = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth)

  // Debug logging
  console.log('RoleGuard Debug:', {
    userRole: user?.role,
    allowedRoles,
    isAuthenticated,
    loading,
    userEmail: user?.email
  })

  // Show loader while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('RoleGuard: Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.log('RoleGuard: Role not allowed', { userRole: user?.role, allowedRoles })
    return <Navigate to="/" replace />
  }

  console.log('RoleGuard: Access granted')
  return children
}

export default RoleGuard