#!/bin/bash

# MCQ Competition Platform - Quick Setup Script
# This script sets up the development environment

set -e  # Exit on error

echo "=========================================="
echo "MCQ Competition Platform - Quick Setup"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL 14+ from https://www.postgresql.org"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL found${NC}"
echo ""

# Setup Backend
echo "=========================================="
echo "Setting up Backend..."
echo "=========================================="

cd backend

# Install dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating backend .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
    echo -e "${YELLOW}⚠️  Please edit backend/.env with your database credentials${NC}"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

echo ""
echo -e "${YELLOW}To initialize the database, run:${NC}"
echo "  cd backend"
echo "  npm run init-db"
echo "  npm run seed"
echo ""

# Setup Frontend
echo "=========================================="
echo "Setting up Frontend..."
echo "=========================================="

cd ../frontend

# Install dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating frontend .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
else
    echo -e "${GREEN}✓ frontend/.env already exists${NC}"
fi

cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Next Steps:"
echo ""
echo "1. Configure your database:"
echo "   - Create PostgreSQL database: mcq_competition"
echo "   - Edit backend/.env with your credentials"
echo ""
echo "2. Initialize the database:"
echo "   cd backend"
echo "   npm run init-db"
echo "   npm run seed"
echo ""
echo "3. Start the backend (Terminal 1):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "4. Start the frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "5. Open your browser:"
echo "   http://localhost:5173"
echo ""
echo "Admin Login:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "=========================================="
