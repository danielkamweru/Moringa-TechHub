import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MessageCircle, ThumbsUp, Reply } from 'lucide-react'
import { fetchComments, addComment, likeComment, reportComment, clearComments } from '../features/comments/commentsSlice'

const CommentThread = ({ contentId, comments: commentsProp }) => {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { items: commentsFromStore, loading } = useSelector((state) => state.comments)
  const comments = commentsProp ?? commentsFromStore ?? []
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [replyTexts, setReplyTexts] = useState({}) // Store reply text for each comment
  const replyTextareaRefs = useRef({}) // Refs for reply textareas

  useEffect(() => {
    if (contentId) {
      dispatch(fetchComments(contentId))
    }
  }, [contentId, dispatch])

  // Clear comments when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(clearComments())
      setNewComment('')
      setReplyTexts({})
      setReplyTo(null)
    }
  }, [isAuthenticated, dispatch])

  // Refetch comments when user logs back in
  useEffect(() => {
    if (isAuthenticated && contentId) {
      dispatch(fetchComments(contentId))
    }
  }, [isAuthenticated, dispatch, contentId])

  // Force cursor to end of reply textareas when text changes
  useEffect(() => {
    Object.keys(replyTexts).forEach(commentId => {
      const textarea = replyTextareaRefs.current[commentId];
      if (textarea && replyTexts[commentId]) {
        const textLength = replyTexts[commentId].length;
        textarea.setSelectionRange(textLength, textLength);
      }
    });
  }, [replyTexts])

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    try {
      await dispatch(addComment({
        contentId: typeof contentId === 'string' ? parseInt(contentId, 10) : contentId,
        text: newComment,
        parentId: null
      })).unwrap()
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault()
    const replyText = replyTexts[parentId] || ''
    if (!replyText.trim() || !user) return

    try {
      await dispatch(addComment({
        contentId: typeof contentId === 'string' ? parseInt(contentId, 10) : contentId,
        text: replyText,
        parentId
      })).unwrap()
      
      // Clear reply text for this specific comment
      setReplyTexts(prev => ({ ...prev, [parentId]: '' }))
      setReplyTo(null)
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleLikeComment = (commentId) => {
    if (!user) return
    dispatch(likeComment(commentId))
  }

  const handleReportComment = (commentId) => {
    if (!user) return
    dispatch(reportComment(commentId))
  }

  const Comment = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {comment.author?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <span className="font-medium text-sm">{comment.author?.full_name || comment.author?.name || comment.author?.username || 'Anonymous'}</span>
              <span className="text-gray-500 text-xs ml-2">
                {new Date(comment.created_at || comment.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 mb-3">{comment.text}</p>
        
        <div className="flex items-center gap-4 text-sm">
          <button 
            onClick={() => handleLikeComment(comment.id)}
            className={`flex items-center gap-1 transition-colors ${
              comment.is_liked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <ThumbsUp size={14} fill={comment.is_liked ? 'currentColor' : 'none'} />
            <span>{comment.likes_count || 0}</span>
          </button>
          
          {!isReply && user && (
            <button 
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="flex items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors"
            >
              <Reply size={14} />
              <span>Reply</span>
            </button>
          )}
        </div>
        
        {replyTo === comment.id && (
          <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-3">
            <textarea
              ref={el => replyTextareaRefs.current[comment.id] = el}
              value={replyTexts[comment.id] || ''}
              onKeyDown={(e) => {
                const currentValue = replyTexts[comment.id] || '';
                const cursorPos = e.target.selectionStart;
                
                // Handle character keys (force LTR input)
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                  e.preventDefault();
                  const newValue = currentValue + e.key;
                  setReplyTexts(prev => ({ ...prev, [comment.id]: newValue }));
                  
                  // Force cursor to end of the new text
                  setTimeout(() => {
                    e.target.setSelectionRange(newValue.length, newValue.length);
                  }, 0);
                }
                // Handle backspace
                else if (e.key === 'Backspace') {
                  e.preventDefault();
                  if (cursorPos > 0) {
                    const newValue = currentValue.slice(0, cursorPos - 1) + currentValue.slice(cursorPos);
                    setReplyTexts(prev => ({ ...prev, [comment.id]: newValue }));
                    
                    setTimeout(() => {
                      e.target.setSelectionRange(cursorPos - 1, cursorPos - 1);
                    }, 0);
                  }
                }
                // Handle delete
                else if (e.key === 'Delete') {
                  e.preventDefault();
                  if (cursorPos < currentValue.length) {
                    const newValue = currentValue.slice(0, cursorPos) + currentValue.slice(cursorPos + 1);
                    setReplyTexts(prev => ({ ...prev, [comment.id]: newValue }));
                    
                    setTimeout(() => {
                      e.target.setSelectionRange(cursorPos, cursorPos);
                    }, 0);
                  }
                }
                // Allow arrow keys, enter, tab, etc.
                else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', 'Tab'].includes(e.key)) {
                  // Let these keys work normally
                }
                // Allow Ctrl/Cmd combinations (copy, paste, etc.)
                else if (e.ctrlKey || e.metaKey) {
                  // Let these work normally
                }
                else {
                  e.preventDefault();
                }
              }}
              onInput={(e) => {
                // Prevent default input behavior
                e.preventDefault();
              }}
              onChange={(e) => {
                // Controlled input - no logging needed
              }}
              placeholder="Write a reply..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              style={{ 
                direction: 'ltr',
                textAlign: 'left'
              }}
              rows="4"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button type="submit" className="btn-primary text-sm">
                Reply
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setReplyTo(null)
                  setReplyTexts(prev => ({ ...prev, [comment.id]: '' }))
                }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      
      {comment.replies?.map(reply => (
        <Comment key={`${comment.id}-reply-${reply.id}`} comment={reply} isReply={true} />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={20} />
        <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
      </div>
      
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => {
                const value = e.target.value;
                setNewComment(value)
                
                // Force cursor to end to prevent RTL input behavior
                setTimeout(() => {
                  e.target.setSelectionRange(value.length, value.length);
                }, 0);
              }}
            placeholder="Share your thoughts..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            style={{ 
                direction: 'ltr',
                textAlign: 'left'
              }}
            rows="3"
          />
          <button type="submit" className="btn-primary mt-2">
            Post Comment
          </button>
        </form>
      )}
      
      <div className="space-y-4">
        {comments.map(comment => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
      
      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  )
}

export default CommentThread