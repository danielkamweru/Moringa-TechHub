const CategoryTag = ({ category, onClick, isSelected = false }) => {
  const baseClasses = "inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer transform hover:scale-105 hover:shadow-md"
  const selectedClasses = isSelected 
    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
    : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200 shadow-sm"

  return (
    <span 
      className={`${baseClasses} ${selectedClasses}`}
      onClick={() => onClick?.(category)}
    >
      {category.name}
    </span>
  )
}

export default CategoryTag