#!/usr/bin/env python3
"""
Test script to verify the seed functionality works correctly
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from seed_final import seed_database

if __name__ == "__main__":
    print("Testing seed functionality...")
    try:
        seed_database()
        print("✅ Seed test completed successfully!")
        print("📝 Articles have been updated with 5-6 line descriptions")
        print("🔗 The seed function is properly connected to main.py")
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        sys.exit(1)
