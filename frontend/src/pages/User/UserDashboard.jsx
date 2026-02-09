import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Filter, Grid, List, Heart, Bookmark, Eye, Play, Headphones, BookOpen, TrendingUp, Star, Bell, Settings, User, Clock, BarChart3, Plus, PenTool, X, FileText, CheckCircle, Edit, Trash2 } from 'lucide-react'
import { fetchContent, likeContent, saveToWishlist, createContent, updateContent, deleteContent } from '../../features/content/contentSlice'
import { fetchCategories, subscribeToCategory, unsubscribeFromCategory } from '../../features/categories/categoriesSlice'
import { fetchRecommendations } from '../../features/users/usersSlice'
import ContentCard from '../../components/ContentCard'
import UserSubscriptions from '../../components/UserSubscriptions'
import AdminActions from '../../components/AdminActions'

const UserDashboard = () => {
  const dispatch = useDispatch()
  const { items: content, loading } = useSelector((state) => state.content)
  const { items: categories } = useSelector((state) => state.categories)
  const { items: recommendations } = useSelector((state) => state.users)
  const { user } = useSelector((state) => state.auth)
  
  const [activeTab, setActiveTab] = useState('create')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [subscribedCategories, setSubscribedCategories] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingContent, setEditingContent] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content_text: '',
    content_type: 'ARTICLE',
    category_id: '',
    media_url: '',
    thumbnail_url: ''
  })
  const [userStats, setUserStats] = useState({
    totalLikes: 0,
    totalComments: 0,
    contentConsumed: 0
  })

  useEffect(() => {
    dispatch(fetchContent())
    dispatch(fetchCategories())
    dispatch(fetchRecommendations(user?.id))
    
    // Load user's subscribed categories from localStorage or API
    const savedSubscriptions = JSON.parse(localStorage.getItem('subscribedCategories') || '[]')
    setSubscribedCategories(savedSubscriptions)
    
    // Calculate user stats
    const stats = calculateUserStats()
    setUserStats(stats)
  }, [dispatch, user])

  const calculateUserStats = () => {
    const viewedContent = JSON.parse(localStorage.getItem('viewedContent') || '[]')
    const likedContent = JSON.parse(localStorage.getItem('likedContent') || '{}')
    const comments = JSON.parse(localStorage.getItem('userComments') || '[]')
    
    return {
      totalLikes: Object.keys(likedContent).length,
      totalComments: comments.length,
      contentConsumed: viewedContent.length
    }
  }

  const handleSubscribe = async (categoryId) => {
    try {
      await dispatch(subscribeToCategory(categoryId)).unwrap()
      const newSubscriptions = [...subscribedCategories, categoryId]
      setSubscribedCategories(newSubscriptions)
      localStorage.setItem('subscribedCategories', JSON.stringify(newSubscriptions))
    } catch (error) {
      console.error('Failed to subscribe:', error)
    }
  }

  const handleUnsubscribe = async (categoryId) => {
    try {
      await dispatch(unsubscribeFromCategory(categoryId)).unwrap()
      const newSubscriptions = subscribedCategories.filter(id => id !== categoryId)
      setSubscribedCategories(newSubscriptions)
      localStorage.setItem('subscribedCategories', JSON.stringify(newSubscriptions))
    } catch (error) {
      console.error('Failed to unsubscribe:', error)
    }
  }

  const handleLike = async (contentId) => {
    try {
      await dispatch(likeContent(contentId)).unwrap()
      dispatch(fetchContent())
    } catch (error) {
      console.error('Failed to like content:', error)
    }
  }

  const handleSaveToWishlist = async (contentId) => {
    try {
      await dispatch(saveToWishlist(contentId)).unwrap()
      dispatch(fetchContent())
    } catch (error) {
      console.error('Failed to save to wishlist:', error)
    }
  }

  const handleCreateContent = async (e) => {
    e.preventDefault()
    try {
      const contentData = {
        ...formData,
        category_id: parseInt(formData.category_id)
      }
      
      if (editingContent) {
        await dispatch(updateContent({ id: editingContent.id, ...contentData })).unwrap()
      } else {
        await dispatch(createContent(contentData)).unwrap()
      }
      
      resetForm()
      dispatch(fetchContent())
    } catch (error) {
      console.error('Failed to save content:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content_text: '',
      content_type: 'ARTICLE',
      category_id: '',
      media_url: '',
      thumbnail_url: ''
    })
    setShowCreateForm(false)
    setEditingContent(null)
  }

  const handleEditContent = (content) => {
    setFormData({
      title: content.title,
      description: content.content_text?.substring(0, 200) || '',
      content_text: content.content_text || '',
      content_type: content.content_type || 'ARTICLE',
      category_id: content.category_id?.toString() || '',
      media_url: content.media_url || '',
      thumbnail_url: content.thumbnail_url || ''
    })
    setEditingContent(content)
    setShowCreateForm(true)
  }

  const handleDeleteContent = async (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await dispatch(deleteContent(id)).unwrap()
        dispatch(fetchContent())
      } catch (error) {
        console.error('Failed to delete content:', error)
      }
    }
  }

  // Filter content based on active tab
  const getFilteredContent = () => {
    let filtered = content || []

    // Apply tab-specific filtering
    if (activeTab === 'for-you') {
      // Use recommendations API or fallback to liked content
      filtered = recommendations && recommendations.length > 0 ? recommendations : content
    } else if (activeTab === 'wishlist') {
      const wishlistContent = JSON.parse(localStorage.getItem('wishlistContent') || '{}')
      filtered = filtered.filter(item => wishlistContent[item.id])
    } else if (activeTab === 'recommended') {
      // Content from subscribed categories
      filtered = filtered.filter(item => 
        subscribedCategories.includes(item.category_id)
      )
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content_text?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category?.name === selectedCategory)
    }

    // Apply content type filter
    if (selectedType) {
      filtered = filtered.filter(item => item.content_type === selectedType)
    }

    return filtered
  }

  const filteredContent = getFilteredContent()
  const myContent = content?.filter(c => c.author_id === user?.id) || []
  const pendingContent = myContent.filter(c => c.status === 'review') || []
  const publishedContent = myContent.filter(c => c.status === 'published') || []

  const tabs = [
    { id: 'my-content', label: 'My Content', icon: FileText },
    { id: 'pending-review', label: 'Pending Review', icon: Clock },
    { id: 'published', label: 'Published', icon: CheckCircle }
  ]

  const publishedCount = myContent.filter(c => c.status === 'published').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <User className="text-blue-600" />
              User Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage your content and track your progress</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Content
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-2xl font-bold text-gray-900">{myContent.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">{publishedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{pendingContent.length}</p>
              </div>
            </div>
          </div>
        </div>


        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>


        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'my-content' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">My Content</h2>
              <div className="space-y-4">
                {myContent.length > 0 ? (
                  myContent.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{item.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{item.content_text?.substring(0, 150)}...</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                              {item.content_type}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              item.status === 'published' ? 'bg-green-100 text-green-800' :
                              item.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status || 'draft'}
                            </span>
                            <span className="text-xs text-gray-500">
                                                          </span>
                            <span className="text-xs text-gray-500">
                              ❤️ {item.likes_count || 0} likes
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingContent(item)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteContent(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">You haven't created any content yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pending-review' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Pending Review</h2>
              <div className="space-y-4">
                {pendingContent.length > 0 ? (
                  pendingContent.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{item.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{item.content_text?.substring(0, 150)}...</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                              {item.content_type}
                            </span>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                              ⏳ Pending Review
                            </span>
                            <span className="text-xs text-gray-500">
                                                          </span>
                            <span className="text-xs text-gray-500">
                              ❤️ {item.likes_count || 0} likes
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingContent(item)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteContent(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No content pending review.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'published' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Published Content</h2>
              <div className="space-y-4">
                {publishedContent.length > 0 ? (
                  publishedContent.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{item.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{item.content_text?.substring(0, 150)}...</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                              {item.content_type}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              ✅ Published
                            </span>
                            <span className="text-xs text-gray-500">
                                                          </span>
                            <span className="text-xs text-gray-500">
                              ❤️ {item.likes_count || 0} likes
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingContent(item)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteContent(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No published content yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Content Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingContent ? 'Edit Content' : 'Create Content'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  resetContentForm()
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateContent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter content title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter content description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.content_text}
                  onChange={(e) => setFormData({ ...formData, content_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your content"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content Type
                  </label>
                  <select
                    value={formData.content_type}
                    onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                    <option value="podcast">Podcast</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Media URL
                  </label>
                  <input
                    type="url"
                    value={formData.media_url}
                    onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/media"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/thumbnail"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingContent ? 'Update Content' : 'Create Content'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    resetContentForm()
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDashboard