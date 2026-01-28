const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Moringa TechHub</h3>
            <p className="text-gray-300">
              Your go-to platform for authentic tech content from the Moringa community.
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/category/fullstack" className="hover:text-white transition-colors">Full Stack</a></li>
              <li><a href="/category/frontend" className="hover:text-white transition-colors">Frontend</a></li>
              <li><a href="/category/devops" className="hover:text-white transition-colors">DevOps</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Moringa TechHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer