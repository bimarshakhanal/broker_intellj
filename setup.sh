#!/bin/bash

# Real Estate Dashboard Setup Script

echo "🏗️  Real Estate Dashboard - Setup Script"
echo "========================================"

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi
echo "✅ Node.js $(node --version)"

if ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed"
    exit 1
fi
echo "✅ Python $(python3 --version)"

if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed (optional for Neo4j)"
fi

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend installation failed"
    exit 1
fi
echo "✅ Frontend dependencies installed"

echo ""
echo "📦 Installing backend dependencies..."
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi
echo "✅ Backend dependencies installed"

# Create .env files
echo ""
echo "🔧 Creating environment files..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env (please update with your Neo4j credentials)"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > frontend/.env.local
    echo "✅ Created frontend/.env.local"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update backend/.env with your Neo4j credentials"
echo "2. Start Neo4j database (locally or with docker)"
echo "3. Run backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "4. Run frontend: cd frontend && npm run dev"
echo "5. Open http://localhost:3000 in your browser"
