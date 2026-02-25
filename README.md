# Real Estate Dashboard

A comprehensive dashboard application for displaying and managing real estate data including people, deals, organizations, and properties. Built with Next.js frontend and FastAPI backend with Neo4j database integration.

## Project Structure

```
broker_intellj/
├── frontend/          # Next.js React frontend
│   ├── src/
│   │   ├── app/      # Next.js app directory with pages
│   │   ├── components/
│   │   ├── lib/      # API client and utilities
│   │   └── pages/    # API routes
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── README.md
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── api/      # API route handlers
│   │   ├── models/   # Pydantic schemas
│   │   ├── services/ # Business logic
│   │   ├── main.py   # FastAPI app
│   │   ├── config.py
│   │   └── database.py
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── README.md
└── agent/            # Existing agent code

```

## Features

### Frontend (Next.js + React + TypeScript)

1. **People Directory** - Grid view of all people with pagination
   - Displays people as cards with name and title
   - Responsive layout (mobile, tablet, desktop)
   - Pagination controls

2. **Person Detail Page** - Comprehensive person information
   - Basic info (name, title, email, phone, bio)
   - Profile image
   - Related deals
   - Associated organizations
   - Properties owned

3. **Deal Details Page** - Full deal information
   - Deal value, status, and type
   - Start/end dates
   - Description
   - Involved parties (with roles)
   - Related properties

4. **Organization Details Page** - Organization information
   - Organization name, type, description
   - Contact information and website
   - Members list
   - Associated deals
   - Managed properties

5. **Property Details Page** - Property information
   - Address and pricing
   - Description and specifications
   - Bedroom/bathroom count
   - Area information
   - Property images
   - Owners
   - Related organizations
   - Associated deals

### Backend (FastAPI + Python)

- **REST API** with proper error handling
- **Neo4j Integration** for relationship queries
- **Pagination** support for large datasets
- **CORS** enabled for frontend communication
- **Auto-generated API documentation** (Swagger/OpenAPI)
- **Service layer** for business logic separation
- **Pydantic** for data validation

## Quick Start

### Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.10+ (for backend)
- **Neo4j** database instance running

### Backend Setup

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
# OR using poetry
poetry install

# Create .env file with Neo4j credentials
cp .env.example .env
# Edit .env with your Neo4j URI and credentials

# Run development server
uvicorn app.main:app --reload
# OR
poetry run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### People
- `GET /api/people?page=1&limit=12` - Get paginated list of people
- `GET /api/people/{person_id}` - Get person details with relationships

### Deals
- `GET /api/deals/{deal_id}` - Get deal details with involved parties and properties

### Organizations
- `GET /api/organizations/{organization_id}` - Get organization details

### Properties
- `GET /api/properties/{property_id}` - Get property details

### Health Check
- `GET /` - API status
- `GET /health` - Health check

## Database Schema (Neo4j)

The application expects the following Neo4j graph structure:

### Nodes
- `Person` - with properties: id, name, title, email, phone, bio, image
- `Deal` - with properties: id, title, description, value, currency, status, type, startDate, endDate
- `Organization` - with properties: id, name, type, description, website, email, phone, address, logo
- `Property` - with properties: id, address, price, currency, description, type, bedrooms, bathrooms, area, status, images

### Relationships
- `Person -[:INVOLVED_IN]-> Deal`
- `Person -[:MEMBER_OF]-> Organization`
- `Person -[:OWNS]-> Property`
- `Organization -[:INVOLVED_IN]-> Deal`
- `Organization -[:MANAGES]-> Property`
- `Deal -[:CONCERNS]-> Property`

## Development

### Frontend Development

```bash
cd frontend

# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Backend Development

```bash
cd backend

# Run with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests (if implemented)
pytest
```

## Configuration

### Frontend Environment Variables

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Backend Environment Variables

Create `backend/.env`:
```
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
CORS_ORIGINS=["http://localhost:3000"]
```

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Icons** - Icon library

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Neo4j** - Graph database
- **Pydantic** - Data validation
- **Python 3.10+** - Latest Python

## Features Implemented

- ✅ Responsive grid layout for people directory
- ✅ Pagination for large datasets
- ✅ Detailed pages for all entity types
- ✅ Related entity navigation
- ✅ Neo4j integration
- ✅ Type-safe frontend with TypeScript
- ✅ RESTful API with proper error handling
- ✅ CORS configuration
- ✅ Auto-generated API documentation
- ✅ Environment variable management

## Future Enhancements

- Add search and filtering capabilities
- Implement authentication and authorization
- Add data editing/creation functionality
- Implement advanced Neo4j queries
- Add graph visualization
- Performance optimization with caching
- Unit and integration tests
- CI/CD pipeline
- Docker containerization

## Troubleshooting

### Frontend Issues

**Port 3000 already in use:**
```bash
npm run dev -- -p 3001
```

**API connection refused:**
- Ensure backend is running on `http://localhost:8000`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

### Backend Issues

**Neo4j connection failed:**
- Verify Neo4j is running and accessible
- Check credentials in `.env`
- Test connection: `neo4j-cli credentials test`

**CORS errors:**
- Ensure frontend URL is in `CORS_ORIGINS` in backend `.env`
- Check headers in browser console

## Contributing

When adding new features:
1. Create feature branches
2. Follow TypeScript/Python conventions
3. Update documentation
4. Test thoroughly before merging

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
