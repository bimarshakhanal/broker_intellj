# Getting Started with Real Estate Dashboard

## Overview

This is a full-stack application for managing and displaying real estate data with AI-powered broker intelligence. It consists of:
- **Frontend**: Next.js + React with TypeScript and Tailwind CSS
- **Backend**: FastAPI with Neo4j database
- **Agent**: Google ADK AI agent for broker extraction and enrichment
- **Database**: Neo4j graph database

## Quick Start (Recommended)

### Using Docker Compose (Easiest)

```bash
# Make sure Docker and Docker Compose are installed

# 1. Start all services (frontend, backend, and agent)
docker compose up --build

# 2. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Backend API Docs: http://localhost:8000/docs
# Agent API: http://localhost:8002
# Neo4j: http://localhost:7474 (if running separately)
```

Note: Neo4j is not included in docker-compose and should be running separately. Update the `NEO4J_URI` environment variable in docker-compose.yml if needed.

### Manual Setup

#### Step 1: Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Update .env with your Neo4j credentials
# NEO4J_URI=bolt://localhost:7687
# NEO4J_USERNAME=neo4j
# NEO4J_PASSWORD=password

# Start the backend
uvicorn app.main:app --reload
```

Backend will be available at: `http://localhost:8000`

#### Step 2: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Start the frontend
npm run dev
```

Frontend will be available at: `http://localhost:3000`

#### Step 3: Agent Setup

```bash
cd agent

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install uv package manager
pip install uv

# Install dependencies
uv sync

# Copy environment file
cp .env.example .env

# Add your Google service account credentials
# Place your service account JSON file in the agent folder
# Update .env with any required configuration

# Start the agent
adk api_server --port 8002
```

Agent API will be available at: `http://localhost:8002`

**What the Agent Does:**
- Extracts real estate broker information from unstructured text (emails, documents, etc.)
- Searches the Neo4j database for matching broker profiles
- Falls back to Google Search if broker not found in database
- Generates comprehensive summaries including name, email, organization, and activity

#### Step 4: Database Setup

You need a running Neo4j instance. Options:

**Option A: Docker (Recommended)**
```bash
docker run -d \
  --name neo4j \
  -p 7687:7687 \
  -p 7474:7474 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest
```

**Option B: Local Installation**
- Download from https://neo4j.com/download/
- Follow installation instructions
- Update `.env` with connection details

**Option C: Neo4j Desktop**
- Download from https://neo4j.com/download/
- Create a new project
- Get the connection details from the project settings

## Accessing the Application

### Frontend
- **URL**: http://localhost:3000
- **Features**: 
  - Browse people in a grid
  - View detailed person information
  - Explore deals, organizations, and properties

### Backend API
- **Base URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **API ReDoc**: http://localhost:8000/redoc

### Agent API
- **Base URL**: http://localhost:8002
- **Purpose**: AI-powered broker extraction and enrichment
- **Main Endpoint**: POST /api/agent/extract-brokers

### Neo4j Database
- **URL**: http://localhost:7474
- **Username**: neo4j
- **Password**: password (default)

## Sample Neo4j Queries

Create some sample data in your Neo4j database:

```cypher
// Create a person
CREATE (p:Person {
  id: 'person-1',
  name: 'John Doe',
  title: 'Real Estate Agent',
  email: 'john@example.com',
  phone: '+1-555-0100'
})

// Create an organization
CREATE (o:Organization {
  id: 'org-1',
  name: 'Acme Real Estate',
  type: 'Agency',
  website: 'https://acme.com'
})

// Create a property
CREATE (pr:Property {
  id: 'prop-1',
  address: '123 Main Street, City, State 12345',
  price: '500000',
  type: 'House',
  bedrooms: 4,
  bathrooms: 2
})

// Create a deal
CREATE (d:Deal {
  id: 'deal-1',
  title: 'House Sale',
  value: '500000',
  status: 'Completed',
  type: 'Sale'
})

// Create relationships
MATCH (p:Person), (o:Organization), (pr:Property), (d:Deal)
WHERE p.id = 'person-1' AND o.id = 'org-1' AND pr.id = 'prop-1' AND d.id = 'deal-1'
CREATE (p)-[:MEMBER_OF]->(o)
CREATE (p)-[:OWNS]->(pr)
CREATE (p)-[:INVOLVED_IN]->(d)
CREATE (d)-[:CONCERNS]->(pr)
CREATE (o)-[:MANAGES]->(pr)
```

## Project Structure

```
broker_intellj/
├── frontend/                 # Next.js React application
│   ├── src/app/             # Next.js pages and layouts
│   │   ├── page.tsx         # Home page (people directory)
│   │   ├── people/[id]/     # Person detail page
│   │   ├── deals/[id]/      # Deal detail page
│   │   ├── organizations/   # Organization detail page
│   │   └── properties/      # Property detail page
│   ├── src/components/      # React components
│   ├── src/lib/            # Utility functions and API client
│   ├── public/             # Static assets
│   └── README.md
│
├── backend/                 # FastAPI Python application
│   ├── app/
│   │   ├── api/            # Route handlers
│   │   │   ├── people.py
│   │   │   ├── deals.py
│   │   │   ├── organizations.py
│   │   │   └── properties.py
│   │   ├── models/         # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   ├── main.py         # FastAPI app
│   │   ├── config.py       # Configuration
│   │   └── database.py     # Neo4j connection
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── README.md
│
├── agent/                   # Google ADK AI Agent
│   ├── intellj_agent/      # Agent implementation
│   │   ├── agent.py        # Main agent logic
│   │   └── subagents/      # Broker extraction, query, search
│   ├── main.py             # Agent entry point
│   ├── pyproject.toml      # Python dependencies
│   └── Dockerfile          # Agent container
├── docker-compose.yml       # Container orchestration
├── setup.sh                 # Setup script
└── README.md
```

## Available Scripts

### Frontend
```bash
cd frontend

npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Backend
```bash
cd backend

# Activate virtual environment first
source venv/bin/activate

uvicorn app.main:app --reload  # Start development server
pytest                         # Run tests (if implemented)
```

### Agent
```bash
cd agent

# Activate virtual environment first
source .venv/bin/activate

adk api_server --port 8002     # Start agent API server
python main.py                 # Run agent directly (alternative)
```

## Troubleshooting

### Frontend won't connect to backend
1. Check that backend is running on `http://localhost:8000`
2. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
3. Check browser console for CORS errors
4. Verify firewall isn't blocking port 8000

### Backend won't connect to Neo4j
1. Verify Neo4j is running and accessible
2. Check credentials in `backend/.env`
3. Verify Neo4j URI is correct (default: `bolt://localhost:7687`)
4. Check logs: `docker logs neo4j` (if using Docker)

### Port already in use
- Change port in startup command: `npm run dev -- -p 3001`
- Change port in uvicorn: `uvicorn app.main:app --port 8001`

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Backend (.env)
```
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
CORS_ORIGINS=["http://localhost:3000"]
```

### Agent (.env)
```
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
GOOGLE_APPLICATION_CREDENTIALS=./sandbox-230010-a8a2a7b265b5.json
```

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload in development mode
2. **API Documentation**: Visit http://localhost:8000/docs for interactive API docs
3. **TypeScript**: Frontend uses TypeScript for type safety
4. **Pydantic**: Backend uses Pydantic for data validation

## Next Steps

1. **Load Data**: Import your real estate data into Neo4j
2. **Customize**: Modify schemas in backend/app/models/schemas.py
3. **Extend**: Add more endpoints and features as needed
4. **Deploy**: Use Docker or your preferred hosting platform

## Support

For detailed information, check:
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [Main README](./README.md)
