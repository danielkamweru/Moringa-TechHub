import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Bookmark } from 'lucide-react'
import { fetchWishlist } from '../features/wishlist/wishlistSlice'
import ContentCard from '../components/ContentCard'
import Loader from '../components/Loader'

const Wishlist = () => {
  const dispatch = useDispatch()
  const { items: wishlistItems, loading } = useSelector((state) => state.wishlist)

  useEffect(() => {
    dispatch(fetchWishlist())
  }, [dispatch])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Bookmark size={24} className="text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm">
          {wishlistItems.length} items
        </span>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map(item => (
            <ContentCard key={item.id} content={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bookmark size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600">Start adding content to your wishlist to save it for later!</p>
        </div>
      )}
    </div>
  )
}

export default Wishlist