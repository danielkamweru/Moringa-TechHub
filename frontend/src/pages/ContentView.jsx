import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Play, FileText, Headphones, Calendar, User } from 'lucide-react'
import { fetchContentById } from '../features/content/contentSlice'
import { fetchComments } from '../features/comments/commentsSlice'
import CommentThread from '../components/CommentThread'
import CategoryTag from '../components/CategoryTag'
import Loader from '../components/Loader'

const ContentView = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { currentContent: content, loading } = useSelector((state) => state.content)
  const { items: comments } = useSelector((state) => state.comments)

  useEffect(() => {
    dispatch(fetchContentById(id))
    dispatch(fetchComments(id))
  }, [dispatch, id])

  const getContentIcon = () => {
    switch (content?.type) {
      case 'video': return <Play size={20} className="text-red-500" />
      case 'audio': return <Headphones size={20} className="text-green-500" />
      default: return <FileText size={20} className="text-blue-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" />
      </div>
    )
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Content not found</h2>
        <p className="text-gray-600">The content you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {content.thumbnail && (
          <div className="relative">
            <img 
              src={content.thumbnail} 
              alt={content.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full flex items-center gap-2">
              {getContentIcon()}
              <span className="text-sm capitalize">{content.type}</span>
            </div>
          </div>
        )}
        
        <div className="p-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <User size={16} />
                <span>By {content.author?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{new Date(content.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {content.categories?.map(category => (
                <CategoryTag key={category.id} category={category} />
              ))}
            </div>
          </div>
          
          <div className="prose max-w-none mb-8">
            {content.type === 'video' && content.videoUrl && (
              <div className="mb-6">
                <video controls className="w-full rounded-lg">
                  <source src={content.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            
            {content.type === 'audio' && content.audioUrl && (
              <div className="mb-6">
                <audio controls className="w-full">
                  <source src={content.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {content.body || content.description}
            </div>
          </div>
        </div>
      </article>
      
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <CommentThread contentId={content.id} comments={comments} />
      </div>
    </div>
  )
}

export default ContentView