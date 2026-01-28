import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { User, Mail, Calendar, Edit } from 'lucide-react'
import { updateUserProfile } from '../features/users/usersSlice'

const Profile = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(updateUserProfile(formData)).unwrap()
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-primary flex items-center gap-2"
          >
            <Edit size={16} />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User size={20} className="text-gray-500" />
              <span className="text-lg">{user?.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-gray-500" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-gray-500" />
              <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
            </div>
            {user?.bio && (
              <div>
                <h3 className="font-medium mb-2">Bio</h3>
                <p className="text-gray-700">{user.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile