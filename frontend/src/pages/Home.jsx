import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Filter, TrendingUp, Sparkles } from 'lucide-react'
import ContentCard from '../components/ContentCard'
import CategoryTag from '../components/CategoryTag'
import Loader from '../components/Loader'
import { fetchContent, setFilters } from '../features/content/contentSlice'
import { fetchCategories } from '../features/categories/categoriesSlice'

const Home = () => {
  const dispatch = useDispatch()
  const { items: content, loading, filters, pagination } = useSelector((state) => state.content)
  const { items: categories } = useSelector((state) => state.categories)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchContent())
  }, [dispatch])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      dispatch(setFilters({ search: searchTerm, category: selectedCategory }))
      dispatch(fetchContent({ search: searchTerm, category: selectedCategory }))
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm, selectedCategory, dispatch])

  const handleCategorySelect = (category) => {
    const newCategory = selectedCategory === category.id ? null : category.id
    setSelectedCategory(newCategory)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-12 w-12 text-yellow-300 animate-pulse-slow" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Welcome to <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Moringa TechHub</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Discover authentic tech content, connect with industry experts, and accelerate your journey in technology
          </p>
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative glass p-2 rounded-2xl">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="Search for articles, videos, podcasts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white/90 backdrop-blur-sm rounded-xl text-gray-900 text-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories Filter */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter size={24} className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Explore Categories</h2>
            </div>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                !selectedCategory 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200 shadow-md'
              }`}
            >
              All Categories
            </button>
            {categories.map(category => (
              <CategoryTag
                key={category.id}
                category={category}
                onClick={handleCategorySelect}
                isSelected={selectedCategory === category.id}
              />
            ))}
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <Loader size="lg" />
              <p className="mt-4 text-gray-600 font-medium">Loading amazing content...</p>
            </div>
          </div>
        ) : (
          <>
            {content.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Sparkles className="text-blue-600" size={20} />
                  Featured Content ({content.length})
                </h3>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {content.map((item, index) => (
                <div key={item.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ContentCard content={item} />
                </div>
              ))}
            </div>

            {content.length === 0 && (
              <div className="text-center py-20">
                <div className="glass p-12 rounded-3xl max-w-md mx-auto">
                  <Search size={64} className="mx-auto text-gray-400 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No content found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or explore different categories</p>
                  <button 
                    onClick={() => { setSearchTerm(''); setSelectedCategory(null) }}
                    className="btn-primary"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => dispatch(fetchContent({ ...filters, page }))}
                    className={`px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 ${
                      page === pagination.page
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Home