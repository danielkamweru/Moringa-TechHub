import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard', { replace: true })
          break
        case 'tech_writer':
          navigate('/tech-writer/dashboard', { replace: true })
          break
        case 'user':
          navigate('/user/dashboard', { replace: true })
          break
        default:
          navigate('/', { replace: true })
      }
    }
  }, [user, isAuthenticated, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return null
}

export default Dashboard
