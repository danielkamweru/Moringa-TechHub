import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { User, Mail, Edit2, Save, X, Camera, Bell, BookOpen, Heart, Upload } from 'lucide-react'
import { updateUserProfile, updateUser } from '../features/auth/authSlice'
import { fetchUserContent } from '../features/content/contentSlice'
import { fetchUserWishlist } from '../features/wishlist/wishlistSlice'
import api from '../services/api'

const Profile = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { items: userContent } = useSelector((state) => state.content)
  const { items: wishlist } = useSelector((state) => state.wishlist)
  
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarKey, setAvatarKey] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    avatar_url: '',
    interests: []
  })

  useEffect(() => {
    console.log('=== useEffect RUNNING - user changed ===', user)
    if (user) {
      console.log('Setting up formData with user data:', {
        avatar_url: user.avatar_url, 
        full_name: user.full_name,
        bio: user.profile?.bio
      })
      setFormData({
        full_name: user.full_name || '',
        bio: user.profile?.bio || '',
        avatar_url: user.avatar_url || '', 
        interests: user.interests || []
      })
      dispatch(fetchUserContent(user.id))
      const token = localStorage.getItem('token')
      if (token) {
        dispatch(fetchUserWishlist())
      }
    }
  }, [user]) 

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }
    
    setUploading(true)
    try {
      console.log('=== STARTING AVATAR UPLOAD ===')
      const formData = new FormData()
      formData.append('file', file)
      
      console.log('Uploading image...')
      const response = await api.post('/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      console.log('App deployed at:', new Date().toISOString())
      console.log('AVATAR UPLOAD FINAL FIX - setTimeout removed - VERSION 3.0')
      console.log('Upload response:', response.data)
      console.log('Response structure:', JSON.stringify(response.data, null, 2))
      
      const newAvatarUrl = response.data.avatar_url
      const timestamp = new Date().getTime()
      const avatarUrlWithTimestamp = `${newAvatarUrl}?t=${timestamp}`
      
      console.log('New avatar URL:', avatarUrlWithTimestamp)
      
      if (response.data) {
        console.log('Updating Redux store with user:', response.data.user)
        console.log('Avatar URL from upload response:', response.data.avatar_url)
        console.log('User avatar_url in response:', response.data.user?.avatar_url)
        console.log('Current formData.avatar_url BEFORE update:', formData.avatar_url)
        
        const updatedUser = {
          ...response.data.user,
          profile: {
            ...response.data.user.profile,
            avatar_url: response.data.avatar_url 
          }
        }
        
        dispatch(updateUser(updatedUser))
        
        setFormData(prev => ({ ...prev, avatar_url: avatarUrlWithTimestamp }))
        
        console.log('Current formData.avatar_url AFTER update:', formData.avatar_url)
        console.log('Redux dispatch completed')
        console.log('Avatar should now persist. Testing...')
        
        setTimeout(() => {
          console.log('5 seconds later - checking if avatar still exists:', formData.avatar_url)
          if (!formData.avatar_url) {
            console.log('❌ AVATAR DISAPPEARED AFTER 5 SECONDS!')
            console.log('Possible causes: Redux state override, useEffect race, or component unmount')
          } else {
            console.log('✅ Avatar still exists after 5 seconds')
          }
        }, 5000)
        
        setTimeout(() => {
          const testImg = new Image()
          testImg.onload = () => console.log('Avatar accessibility test: SUCCESS')
          testImg.onerror = () => console.log('Avatar accessibility test: FAILED', avatarUrlWithTimestamp)
          testImg.src = avatarUrlWithTimestamp
        }, 1000)
      }
      
      alert('Profile updated successfully!')
      
      setAvatarKey(prev => prev + 1)
      
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      console.log('=== STARTING PROFILE SAVE ===')
      const profileData = {
        full_name: formData.full_name,
        bio: formData.bio
      }
      
      console.log('Sending profile data:', profileData)
      const response = await api.put('/auth/profile', profileData)
      console.log('Profile update response:', response.data)
      
      dispatch(updateUserProfile(response.data))
      
      setIsEditing(false)
      
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        bio: user.profile?.bio || '',
        avatar_url: user.avatar_url || '',
        interests: user.interests || []
      })
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'content', label: 'My Content', icon: BookOpen },
    { id: 'wishlist', label: 'Wishlist', icon: Heart }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {formData.avatar_url ? (
                    <img 
                      key={avatarKey} 
                      src={formData.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover" 
                      onLoad={() => console.log('Avatar loaded successfully:', formData.avatar_url)}
                      onError={(e) => {
                        console.error('Avatar image failed to load:', formData.avatar_url);
                        if (user?.avatar_url && formData.avatar_url !== user?.avatar_url) {
                          const fallbackUrl = user.avatar_url.startsWith('http') 
                            ? user.avatar_url 
                            : `https://moringa-techhub.onrender.com${user.avatar_url}`;
                          e.target.src = fallbackUrl;
                        } else {
                          e.target.style.display = 'none';
                        }
                      }} 
                    />
                  ) : user?.avatar_url ? (
                    <img 
                      key={`preview-fallback-${avatarKey}`} 
                      src={user.avatar_url.startsWith('http') 
                        ? user.avatar_url 
                        : `https://moringa-techhub.onrender.com${user.avatar_url}`} 
                      alt="Avatar preview" 
                      className="w-full h-full rounded-full object-cover" 
                      onLoad={() => console.log('Preview fallback loaded:', user.avatar_url)}
                      onError={(e) => {
                        console.error('Preview fallback failed:', user.avatar_url);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <User size={40} className="text-gray-400" />
                  )}
                </div>
                
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer text-white hover:text-blue-200 transition-colors"
                  >
                    {uploading ? (
                      <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Camera size={24} />
                    )}
                  </label>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.full_name}</h1>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                    {user?.role}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    user?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEditing ? <X size={18} /> : <Edit2 size={18} />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="mt-6">
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full p-2 border rounded-lg h-24 resize-none"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-700">
                {user?.profile?.bio || 'No bio added yet. Click edit to add your bio.'}
              </p>
            )}
          </div>

          {isEditing && (
            <div className="mt-6 flex gap-2">
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save size={18} />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Edit Profile Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-medium">{new Date(user?.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Status</p>
                    <p className="font-medium capitalize">{user?.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium capitalize">{user?.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">My Content</h3>
              <div className="space-y-4">
                {userContent?.length > 0 ? (
                  userContent.map((content) => (
                    <div key={content.id} className="border rounded-lg p-4">
                      <h4 className="font-medium">{content.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{content.content_text?.substring(0, 100)}...</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                          {content.content_type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {content.views_count || 0} views
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No content created yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">My Wishlist</h3>
              <div className="space-y-4">
                {wishlist?.length > 0 ? (
                  wishlist.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{item.content_text?.substring(0, 100)}...</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                          {item.content_type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.views_count || 0} views
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No items in wishlist yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile