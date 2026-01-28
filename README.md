# Moringa TechHub

A modern platform where students can get authentic and verified information/inspiration/advice about the tech space. Built with React, Redux Toolkit, Tailwind CSS, and FastAPI.

## Features

### User Roles
- **Admin**: Manage users, moderate content, create categories
- **Tech Writers**: Create and manage content, moderate discussions
- **Users**: Browse content, comment, maintain wishlist, get recommendations

### Core Functionality
- Multi-user authentication system
- Content creation and management (articles, videos, audio)
- Category-based content organization
- Comment system with threading (Reddit-style)
- Wishlist functionality
- Content recommendation system
- Real-time notifications
- Content moderation tools

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon library
- **Axios** - HTTP client
- **Vite** - Fast build tool

### Backend (To be implemented)
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Database
- **JWT** - Authentication

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd moringa-techhub
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── app/                 # Redux store configuration
│   ├── components/          # Reusable UI components
│   ├── features/           # Redux slices by feature
│   │   ├── auth/
│   │   ├── content/
│   │   ├── comments/
│   │   ├── categories/
│   │   ├── wishlist/
│   │   └── notifications/
│   ├── pages/              # Page components
│   ├── routes/             # Routing configuration
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
```

## Key Features Implementation

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Protected routes with role guards

### Content Management
- CRUD operations for content
- Support for articles, videos, and audio
- Category-based organization
- Content approval workflow

### Interactive Features
- Nested comment system
- Like/dislike functionality
- Wishlist management
- Content sharing

### Admin Dashboard
- User management
- Content moderation
- Category management
- Platform analytics

### Writer Dashboard
- Content creation and editing
- Content performance tracking
- Draft management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.