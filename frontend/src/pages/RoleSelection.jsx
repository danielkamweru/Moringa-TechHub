import { Link } from 'react-router-dom'
import { User, PenTool, Shield, ArrowRight } from 'lucide-react'

const RoleSelection = () => {
  const roles = [
    {
      type: 'user',
      title: 'User',
      icon: User,
      description: 'Browse content, comment, and manage your wishlist',
      features: [
        'Read/view/listen to content',
        'Comment and start discussions',
        'Add content to wishlist',
        'Get personalized recommendations',
        'Subscribe to categories'
      ],
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      type: 'writer',
      title: 'Tech Writer',
      icon: PenTool,
      description: 'Create and manage content, moderate discussions',
      features: [
        'Create and edit content',
        'Manage content categories',
        'Moderate discussions',
        'Review and approve content',
        'Track content performance'
      ],
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      type: 'admin',
      title: 'Admin',
      icon: Shield,
      description: 'Full platform management and user control',
      features: [
        'Manage all users',
        'Moderate all content',
        'Create content categories',
        'Approve/reject content',
        'Platform analytics'
      ],
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Role
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select how you'd like to access Moringa TechHub. Each role has different permissions and capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => {
            const IconComponent = role.icon
            return (
              <div key={role.type} className={`card hover:scale-105 ${role.bgColor} border-2 border-transparent hover:border-current ${role.textColor}`}>
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${role.color} flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{role.title}</h3>
                  <p className="text-gray-600">{role.description}</p>
                </div>

                <div className="space-y-3 mb-8">
                  {role.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${role.color}`} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Link 
                    to={`/login?role=${role.type}`}
                    className={`w-full btn-primary bg-gradient-to-r ${role.color} hover:opacity-90 flex items-center justify-center gap-2`}
                  >
                    Login as {role.title}
                    <ArrowRight size={16} />
                  </Link>
                  <Link 
                    to={`/register?role=${role.type}`}
                    className="w-full btn-secondary text-center block"
                  >
                    Register as {role.title}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">Already have an account?</p>
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in with existing credentials
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RoleSelection