#!/bin/bash

# Create PostgreSQL user and database
echo "Setting up PostgreSQL for Moringa TechHub..."

# Create user 'user' if it doesn't exist
sudo -u postgres psql -c "CREATE USER \"user\" WITH CREATEDB;" 2>/dev/null || echo "User might already exist"

# Create database
sudo -u postgres createdb -O user moringa_techhub 2>/dev/null || echo "Database might already exist"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE moringa_techhub TO \"user\";" 2>/dev/null

echo "PostgreSQL setup complete!"
echo "Testing connection..."

# Test connection
psql -d moringa_techhub -c "SELECT version();" && echo " Connection successful!" || echo " Connection failed"