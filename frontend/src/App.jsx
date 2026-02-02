import React from 'react'
import AppRoutes from './routes/AppRoutes'
import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-600 text-center py-8">
        Welcome to Moringa TechHub
      </h1>
      <AppRoutes />
    </div>
  )
}

export default App
