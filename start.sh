#!/bin/bash

echo "🚀 Aiutante AI Code Assistant - Startup Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v14 or higher.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js and npm found${NC}"
echo ""

# Install extension dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing extension dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install extension dependencies${NC}"
        exit 1
    fi
fi

# Compile extension
echo -e "${YELLOW}🔨 Compiling extension...${NC}"
npm run compile
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to compile extension${NC}"
    exit 1
fi

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
npm test
if [ $? -ne 0 ]; then
    echo -e "${RED}⚠️  Some tests failed (this might be okay)${NC}"
fi

echo ""
echo -e "${GREEN}✓ Extension setup complete!${NC}"
echo ""

# Check if web-dashboard exists
if [ -d "web-dashboard" ]; then
    echo -e "${YELLOW}📦 Setting up web dashboard...${NC}"
    
    cd web-dashboard
    
    # Install web dashboard dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing dashboard dependencies...${NC}"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to install dashboard dependencies${NC}"
            exit 1
        fi
    fi
    
    # Create data directory if needed
    mkdir -p data
    
    # Create .env if it doesn't exist
    if [ ! -f ".env" ]; then
        echo "PORT=5000" > .env
        echo "NODE_ENV=development" >> .env
        echo -e "${GREEN}✓ Created .env file${NC}"
    fi
    
    echo -e "${GREEN}✓ Dashboard setup complete!${NC}"
    echo ""
    
    # Ask user if they want to start the dashboard
    read -p "Do you want to start the web dashboard server? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🌐 Starting web dashboard on http://localhost:5000${NC}"
        npm start
    fi
    
    cd ..
else
    echo -e "${YELLOW}⚠️  Web dashboard not found${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Open VS Code"
echo "2. Install the extension from: out/extension.js"
echo "3. Press Ctrl+Shift+P and search for 'Login to AI Service'"
echo "4. Enter your email and OpenAI API key"
echo "5. Start using AI features!"
echo ""
echo "Documentation: See SETUP.md for detailed instructions"
echo "================================================"
