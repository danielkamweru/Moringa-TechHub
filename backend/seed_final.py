from app.database.connection import get_db
from app.database.models import User, Category, Content, ContentTypeEnum, user_wishlist, Comment, Like, Notification, ContentFlag
import logging

logger = logging.getLogger(__name__)

SEED_CONTENT = [
    # Full-Stack Videos
    {"title": "Full Stack Web Development in 2026: Direct roadmap covering the modern stack", "category": "Full-Stack", "type": "VIDEO", "url": "https://www.youtube.com/watch?v=nu_pCVPKzTk", "description": "Complete roadmap for full-stack development in 2026", "thumbnail": "https://img.youtube.com/vi/nu_pCVPKzTk/maxresdefault.jpg"},
    {"title": "Building a Full Stack App from Scratch: High-level architectural walkthrough", "category": "Full-Stack", "type": "VIDEO", "url": "https://www.youtube.com/watch?v=ngc9gnGgUdA", "description": "Architectural walkthrough for building full-stack applications", "thumbnail": "https://img.youtube.com/vi/ngc9gnGgUdA/maxresdefault.jpg"},
    
    # Full-Stack Podcasts
    {"title": "The Changelog – What Developers Miss About Full-Stack Engineering", "category": "Full-Stack", "type": "PODCAST", "url": "https://changelog.com/podcast/469", "description": "Discussion on what developers miss about full-stack engineering", "thumbnail": "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=225&fit=crop&auto=format&q=80"},
    {"title": "Syntax FM - Full Stack Development", "category": "Full-Stack", "type": "PODCAST", "url": "https://syntax.fm", "description": "Full stack development discussions and tips", "thumbnail": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&auto=format&q=80"},
    
    # Full-Stack Blogs (ARTICLES - Enhanced with 5-6 lines)
    {"title": "Modern Full-Stack Development: From Monolith to Microservices", "subtitle": "A comprehensive guide to modern architecture patterns", "category": "Full-Stack", "type": "ARTICLE", "url": "", "description": "A comprehensive guide to understanding the evolution of full-stack development architectures in modern software engineering. This detailed article explores when to use monoliths versus microservices, with real-world examples and case studies from successful companies. Learn about modern tools like Docker, Kubernetes, and serverless platforms that are transforming how we build applications. Discover best practices for API design, database management, and deployment strategies in distributed systems. Understand the trade-offs between different architectural approaches and when to apply them based on your specific requirements. Explore real-world scenarios and learn from industry leaders who have successfully made these transitions in their organizations. Master the skills needed to architect scalable systems that can grow with your business needs and handle millions of users. Learn about security considerations, monitoring strategies, and performance optimization techniques for modern architectures. Perfect for architects and senior developers making critical architectural decisions that impact business success.", "thumbnail": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop&auto=format&q=80"},
    {"title": "The Complete Guide to Full-Stack Testing Strategies", "subtitle": "Master testing methodologies for robust applications", "category": "Full-Stack", "type": "ARTICLE", "url": "", "description": "Master testing methodologies for full-stack applications including unit testing, integration testing, E2E testing, and performance testing. This comprehensive guide covers essential frameworks like Jest, Cypress, and Playwright that are industry standards used by top tech companies. Learn how to implement testing strategies that catch bugs early and ensure code quality throughout the entire development lifecycle. Discover continuous integration testing and automated testing pipelines that integrate seamlessly with your deployment workflow for maximum efficiency. Explore advanced testing patterns like contract testing and chaos engineering that go beyond basic testing approaches to ensure system resilience. Understand how to measure testing effectiveness and improve coverage over time using modern metrics and tools that provide actionable insights. Learn how to create a testing culture within your development team that values quality and reliability above all else. Master the art of writing maintainable tests that serve as living documentation for your codebase. Perfect for teams looking to improve their testing practices and deliver more robust applications.", "thumbnail": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop&auto=format&q=80"},
    
    # Front-End Videos
    {"title": "React vs Next.js – Which Should You Learn?", "category": "Front-End", "type": "VIDEO", "url": "https://www.youtube.com/watch?v=KjY94sAKLlw", "description": "Comparison between React and Next.js frameworks", "thumbnail": "https://img.youtube.com/vi/KjY94sAKLlw/maxresdefault.jpg"},
    {"title": "Modern CSS: Container Queries & Web Components", "category": "Front-End", "type": "VIDEO", "url": "https://www.youtube.com/watch?v=Zddz_R1RnfM", "description": "Learn modern CSS features including container queries", "thumbnail": "https://img.youtube.com/vi/Zddz_R1RnfM/maxresdefault.jpg"},
    
    # Front-End Podcasts
    {"title": "ShopTalk Show – The State of CSS (Episode 540)", "category": "Front-End", "type": "PODCAST", "url": "https://shoptalkshow.com/540/", "description": "Discussion on the current state of CSS", "thumbnail": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&auto=format&q=80"},
    {"title": "Syntax.fm – Modern Front-End Tooling", "category": "Front-End", "type": "PODCAST", "url": "https://syntax.fm/show/659/modern-frontend-tooling", "description": "Modern tooling for front-end development", "thumbnail": "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=225&fit=crop&auto=format&q=80"},
    
    # Front-End Blogs (ARTICLES - Enhanced with 5-6 lines)
    {"title": "Advanced React Patterns: Building Scalable Component Architectures", "subtitle": "Master modern React design patterns and best practices", "category": "Front-End", "type": "ARTICLE", "url": "", "description": "Explore advanced React patterns including compound components, render props, custom hooks, and context API for building maintainable applications. This comprehensive guide covers modern React design patterns that scale with your application complexity and team size for enterprise-level projects. Learn how to create reusable components that are flexible and easy to maintain across different projects and use cases while following best practices. Discover state management patterns and performance optimization techniques used by large-scale React applications worldwide that serve millions of users. Understand when to use each pattern and how to combine them effectively for maximum code reusability and developer productivity. Explore real-world examples from large-scale React applications that handle complex user interactions and massive data volumes. Master the art of component composition and prop drilling solutions that scale with your application growth and team expansion. Learn how to implement proper error boundaries and loading states for better user experience and application reliability. Perfect for React developers looking to level up their skills and build enterprise-grade applications.", "thumbnail": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop&auto=format&q=80"},
    {"title": "CSS Grid and Flexbox: The Ultimate Guide to Modern Layouts", "subtitle": "Create responsive layouts without frameworks", "category": "Front-End", "type": "ARTICLE", "url": "", "description": "Master modern CSS layout techniques with Grid and Flexbox for creating responsive designs without relying on frameworks. This detailed guide covers practical examples, responsive design patterns, and complex layout creation for modern web applications that work across all devices. Learn when to use Grid versus Flexbox and how to combine them effectively for optimal layout solutions that provide the best user experience. Discover common layout patterns and how to implement them with modern CSS for maximum browser compatibility and performance. Understand browser compatibility and fallback strategies for older browsers and progressive enhancement approaches that ensure accessibility. Explore advanced techniques like subgrid and container queries that are revolutionizing responsive design and making layouts more flexible. Learn how to create accessible layouts that work for all users including those with disabilities following WCAG guidelines. Master the CSS skills needed to create professional, responsive websites that work across all devices and screen sizes. Perfect for developers who want to master CSS layouts and build modern, responsive web interfaces.", "thumbnail": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop&auto=format&q=80"},
    
    # DevOps Videos
    {"title": "DevOps Roadmap 2026 – Linux to Kubernetes", "category": "DevOps", "type": "VIDEO", "url": "https://www.youtube.com/watch?v=9pZ2xmsSDdo", "description": "Complete DevOps roadmap from Linux to Kubernetes", "thumbnail": "https://img.youtube.com/vi/9pZ2xmsSDdo/maxresdefault.jpg"},
    {"title": "CI/CD Explained for Beginners", "category": "DevOps", "type": "VIDEO", "url": "https://www.youtube.com/watch?v=scEDHsr3APg", "description": "Beginner-friendly explanation of CI/CD concepts", "thumbnail": "https://img.youtube.com/vi/scEDHsr3APg/maxresdefault.jpg"},
    
    # DevOps Podcasts
    {"title": "The Changelog – CI/CD Is a Culture Problem", "category": "DevOps", "type": "PODCAST", "url": "https://changelog.com/podcast/453", "description": "Discussion on CI/CD as a cultural challenge", "thumbnail": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop&auto=format&q=80"},
    {"title": "DevOps and Docker Talk", "category": "DevOps", "type": "PODCAST", "url": "https://podcast.bretfisher.com/", "description": "DevOps and Docker discussions", "thumbnail": "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=225&fit=crop"},
    
    # DevOps Blogs (ARTICLES - Enhanced with 5-6 lines)
    {"title": "Infrastructure as Code: Terraform Best Practices and Patterns", "subtitle": "Master cloud infrastructure automation with Terraform", "category": "DevOps", "type": "ARTICLE", "url": "", "description": "Learn Infrastructure as Code principles with Terraform for automating cloud infrastructure deployment and management at scale across multiple environments. This comprehensive guide covers best practices for writing maintainable, scalable infrastructure code that can be managed by teams of any size. Discover module design patterns, state management strategies, and multi-cloud deployment approaches that work across different cloud providers like AWS, Azure, and GCP. Learn how to implement proper testing and security in your infrastructure code to ensure reliability and compliance with industry standards. Understand how to handle secrets and sensitive data in IaC using industry-standard practices and tools like HashiCorp Vault. Explore advanced patterns like remote state management and workspace strategies for large organizations with complex requirements. Master the techniques needed to manage infrastructure effectively across development, staging, and production environments while maintaining consistency. Perfect for DevOps engineers and cloud architects looking to implement robust infrastructure automation.", "thumbnail": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop&auto=format&q=80"},
    {"title": "Container Orchestration with Kubernetes: A Production Guide", "subtitle": "Deploy and manage containerized applications at scale", "category": "DevOps", "type": "ARTICLE", "url": "", "description": "Complete guide to running Kubernetes in production environments with best practices and real-world experience from large-scale deployments. This detailed article covers deployment strategies, monitoring solutions, scaling techniques, and security configurations for production clusters serving millions of users. Learn how to troubleshoot common issues in distributed systems and optimize performance for cost efficiency and reliability. Discover networking patterns and storage management strategies that work in enterprise environments with complex requirements. Understand service mesh implementation and traffic management for microservices architectures that need high availability. Explore backup and disaster recovery approaches for containerized applications ensuring business continuity and data protection. Master the skills needed to maintain reliable Kubernetes clusters that can handle massive traffic spikes and scale automatically. Perfect for Kubernetes administrators and platform engineers managing production workloads.", "thumbnail": "https://images.unsplash.com/photo-1668091257030-6b6c5d4a16b2?w=400&h=225&fit=crop&auto=format&q=80"},
    
    # Backend Blogs (ARTICLES - Enhanced with 5-6 lines)
    {"title": "Microservices Architecture: Design Patterns and Best Practices", "subtitle": "Build scalable distributed systems with confidence", "category": "Back-End", "type": "ARTICLE", "url": "", "description": "Comprehensive guide to microservices architecture for building scalable and maintainable distributed systems that can handle enterprise-level traffic. Learn about service discovery mechanisms, API gateway patterns, circuit breakers, and distributed tracing for monitoring complex systems with hundreds of services. Explore strategies for managing complex distributed systems and ensuring data consistency across multiple services and databases in different geographic regions. Discover communication patterns like REST, GraphQL, gRPC, and message queuing systems for different use cases and performance requirements. Understand how to handle failures and implement graceful degradation to maintain service availability during outages and network issues. Learn about event-driven architecture and message queuing patterns that enable loose coupling between services and improve system resilience. Master the skills needed to design, deploy, and maintain microservices that scale horizontally and vertically based on demand. Perfect for architects building microservice-based applications that need to handle millions of requests.", "thumbnail": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop&auto=format&q=80"},
    {"title": "Database Design Patterns: Scaling from SQL to NoSQL", "subtitle": "Master database architecture for modern applications", "category": "Back-End", "type": "ARTICLE", "url": "", "description": "Master database design patterns for modern applications handling different data models and scalability requirements from small startups to large enterprises. Explore the trade-offs between SQL and NoSQL databases and when to use each approach based on your specific requirements and data characteristics. Learn about indexing strategies, sharding techniques, replication patterns, and data consistency models for distributed systems that need high availability. Discover how to choose the right database technology for your specific use case considering factors like read/write patterns, data volume, and query complexity. Understand performance tuning and query optimization strategies that can make your database 10x faster and reduce costs significantly. Explore backup and disaster recovery planning for different database types ensuring business continuity and data protection. Master the skills needed to design databases that can handle massive scale while maintaining performance and reliability.", "thumbnail": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop&auto=format&q=80"},
    
]

def seed_database():
    db = next(get_db())
    
    try:
        # Create categories
        categories = ["Full-Stack", "Front-End", "DevOps", "Back-End"]
        category_objects = {}
        
        for cat_name in categories:
            existing_cat = db.query(Category).filter(Category.name == cat_name).first()
            if not existing_cat:
                category = Category(name=cat_name, description=f"{cat_name} development content")
                db.add(category)
                db.commit()
                db.refresh(category)
                category_objects[cat_name] = category
            else:
                category_objects[cat_name] = existing_cat
        
        # Get admin user
        admin_user = db.query(User).filter(User.email == "admin@techhub.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@techhub.com",
                username="admin",
                full_name="Admin User",
                hashed_password="simple_hash",
                is_admin=True,
                is_active=True
            )
        
        # Seed content
        # First, delete all existing content to start fresh
        # Delete in correct order to avoid foreign key constraints
        db.query(ContentFlag).delete()
        db.query(Notification).delete()
        db.query(Like).delete()
        db.query(Comment).delete()
        db.query(user_wishlist).delete()
        db.query(Content).delete()
        db.commit()
        
        for content_item in SEED_CONTENT:
            # Check if content already exists
            existing_content = db.query(Content).filter(
                Content.title == content_item["title"],
                Content.category == category_objects[content_item["category"]]
            ).first()
            
            if not existing_content:
                new_content = Content(
                    title=content_item["title"],
                    subtitle=content_item.get("subtitle", ""),
                    content_text=content_item["description"],
                    category=category_objects[content_item["category"]],
                    content_type=getattr(ContentTypeEnum, content_item["type"]),  # Use proper enum
                    media_url=content_item.get("url", ""),
                    thumbnail_url=content_item["thumbnail"]
                )
                db.add(new_content)
                db.commit()
        
        logger.info(f"Database seeded successfully with {len(SEED_CONTENT)} items")
        
    except Exception as e:
        logger.error(f"Database seeding failed: {e}")
        raise e
