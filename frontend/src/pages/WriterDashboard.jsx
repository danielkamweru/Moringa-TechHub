import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { fetchContent, createContent, updateContent, deleteContent } from '../features/content/contentSlice'
import { fetchCategories } from '../features/categories/categoriesSlice'

const WriterDashboard = () => {
  const dispatch = useDispatch()
  const { items: content } = useSelector((state) => state.content)
  const { items: categories } = useSelector((state) => state.categories)
  const { user } = useSelector((state) => state.auth)
  
  const [showForm, setShowForm] = useState(false)
  const [editingContent, setEditingContent] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    body: '',
    type: 'article',
    categories: [],
  })

  const userContent = content.filter(item => item.author?.id === user?.id)

  useEffect(() => {
    dispatch(fetchContent())
    dispatch(fetchCategories())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingContent) {
        await dispatch(updateContent({ id: editingContent.id, ...formData })).unwrap()
      } else {
        await dispatch(createContent(formData)).unwrap()
      }
      resetForm()
    } catch (error) {
      console.error('Failed to save content:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      body: '',
      type: 'article',
      categories: [],
    })
    setShowForm(false)
    setEditingContent(null)
  }

  const handleEdit = (content) => {
    setFormData({
      title: content.title,
      description: content.description,
      body: content.body || '',
      type: content.type,
      categories: content.categories?.map(c => c.id) || [],
    })
    setEditingContent(content)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await dispatch(deleteContent(id)).unwrap()
      } catch (error) {
        console.error('Failed to delete content:', error)
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Writer Dashboard</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Create Content
        </button>
      </div>

      {/* Content Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingContent ? 'Edit Content' : 'Create New Content'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              categories: [...formData.categories, category.id]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              categories: formData.categories.filter(id => id !== category.id)
                            })
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  placeholder="Write your content here..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary">
                  {editingContent ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">My Content ({userContent.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {userContent.map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="capitalize">{item.type}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  <span className={`px-2 py-1 rounded-full ${
                    item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status || 'draft'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(`/content/${item.id}`, '_blank')}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  title="View"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {userContent.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">You haven't created any content yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary mt-4"
              >
                Create Your First Content
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WriterDashboard