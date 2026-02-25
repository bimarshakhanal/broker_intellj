# Real Estate Dashboard API

FastAPI backend for Real Estate Dashboard with Neo4j database integration.

## Features

- **People Endpoints**: Get paginated people list and detailed person information
- **Deal Endpoints**: Get deal details with involved parties and properties
- **Organization Endpoints**: Get organization details with members, deals, and properties
- **Property Endpoints**: Get property details with owners, deals, and managing organizations
- **Neo4j Integration**: Direct graph database integration for complex relationship queries
- **CORS Support**: Configured for frontend integration
- **API Documentation**: Automatic OpenAPI/Swagger documentation

## Setup

### Prerequisites
- Python 3.10+
- Neo4j database running
- `uv` package manager

### 1. Install uv

```bash
# On macOS or Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# On Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 2. Create Virtual Environment and Install Dependencies

```bash
# Create virtual environment
uv venv

# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
uv pip install -r requirements.txt
```

### 3. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your Neo4j database credentials
```

Example `.env` file:
```
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
```

### 4. Run the Server

```bash
# Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python module
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
app/
├── api/              # API route handlers
│   ├── people.py     # People endpoints
│   ├── deals.py      # Deal endpoints
│   ├── organizations.py  # Organization endpoints
│   └── properties.py # Property endpoints
├── models/
│   └── schemas.py    # Pydantic schemas
├── services/
│   └── entity_service.py  # Business logic
├── config.py         # Configuration
├── database.py       # Neo4j connection
└── main.py          # FastAPI app setup
```

## API Endpoints

### People
- `GET /api/people` - Get paginated list of people
- `GET /api/people/{person_id}` - Get person details

### Deals
- `GET /api/deals/{deal_id}` - Get deal details

### Organizations
- `GET /api/organizations/{organization_id}` - Get organization details

### Properties
- `GET /api/properties/{property_id}` - Get property details

## Technology Stack

- **FastAPI**: Modern Python web framework
- **Neo4j**: Graph database
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server
- **Python 3.10+**: Latest Python version
