#!/usr/bin/env python3
"""Test script to check if routes can be imported"""
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing imports...")
    from app.routes import categories
    print("✅ Categories router imported successfully")
    
    # Test if router has routes
    print(f"Router routes: {len(categories.router.routes)}")
    for route in categories.router.routes:
        print(f"  - {route.methods} {route.path}")
    
    # Test main app
    from app.main import app
    print("✅ Main app imported successfully")
    
    # Check if categories routes are in app
    category_routes = [r for r in app.routes if '/api/categories' in r.path]
    print(f"Categories routes in main app: {len(category_routes)}")
    for route in category_routes:
        print(f"  - {route.methods} {route.path}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
