import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import usersReducer from '../features/users/usersSlice'
import contentReducer from '../features/content/contentSlice'
import commentsReducer from '../features/comments/commentsSlice'
import categoriesReducer from '../features/categories/categoriesSlice'
import wishlistReducer from '../features/wishlist/wishlistSlice'
import notificationsReducer from '../features/notifications/notificationsSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  content: contentReducer,
  comments: commentsReducer,
  categories: categoriesReducer,
  wishlist: wishlistReducer,
  notifications: notificationsReducer,
})

export default rootReducer