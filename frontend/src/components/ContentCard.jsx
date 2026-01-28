import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Share2, Bookmark, Play, FileText, Headphones, Eye } from 'lucide-react'
import { toggleWishlist } from '../features/wishlist/wishlistSlice'
import { likeContent } from '../features/content/contentSlice'
import CategoryTag from './CategoryTag'

const ContentCard = ({ content }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)
  
  const [isLiked, setIsLiked] = useState(content.isLiked)
  const [likesCount, setLikesCount] = useState(content.likesCount || 0)
  
  const isInWishlist = wishlistItems.some(item => item.id === content.id)

  const handleLike = async () => {
    if (!user) return
    
    try {
      await dispatch(likeContent(content.id)).unwrap()
      setIsLiked(!isLiked)
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
    } catch (error) {
      console.error('Failed to like content:', error)
    }
  }

  const handleWishlist = () => {
    if (!user) return
    dispatch(toggleWishlist(content))
  }

  const getContentIcon = () => {
    switch (content.type) {
      case 'video': return <Play size={16} className="text-red-500" />
      case 'audio': return <Headphones size={16} className="text-green-500" />
      default: return <FileText size={16} className="text-blue-500" />
    }
  }

  return (
    <div className="card group hover:scale-[1.02] animate-fade-in">
      {content.thumbnail && (
        <div className="relative mb-4 overflow-hidden rounded-xl">
          <img 
            src={content.thumbnail} 
            alt={content.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-3 left-3 glass text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium">
            {getContentIcon()}
            <span className="capitalize">{content.type}</span>
          </div>
          <div className="absolute bottom-3 right-3 glass text-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs">
            <Eye size={12} />
            <span>{content.views || 0}</span>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Link to={`/content/${content.id}`} className="flex-1 group">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
              {content.title}
            </h3>
          </Link>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{content.description}</p>
        
        <div className="flex flex-wrap gap-2">
          {content.categories?.slice(0, 2).map(category => (
            <CategoryTag key={category.id} category={category} />
          ))}
          {content.categories?.length > 2 && (
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
              +{content.categories.length - 2} more
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {content.author?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{content.author?.name}</p>
              <p className="text-xs text-gray-500">{new Date(content.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1 p-2 rounded-xl transition-all hover:scale-110 ${
                isLiked ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>
            
            <Link to={`/content/${content.id}#comments`} className="flex items-center gap-1 p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all hover:scale-110">
              <MessageCircle size={16} />
              <span className="text-sm font-medium">{content.commentsCount || 0}</span>
            </Link>
            
            {user && (
              <button 
                onClick={handleWishlist}
                className={`p-2 rounded-xl transition-all hover:scale-110 ${
                  isInWishlist ? 'text-yellow-500 bg-yellow-50' : 'text-gray-500 hover:text-yellow-500 hover:bg-yellow-50'
                }`}
              >
                <Bookmark size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentCard