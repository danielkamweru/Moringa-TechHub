const Loader = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="relative">
        <div className={`animate-spin rounded-full border-4 border-gray-200 ${sizeClasses[size]}`}></div>
        <div className={`animate-spin rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600 absolute top-0 left-0 ${sizeClasses[size]}`}></div>
      </div>
    </div>
  )
}

export default Loader