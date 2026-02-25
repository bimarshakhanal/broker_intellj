#!/bin/bash

# Real Estate Dashboard - Quick Reference Card

cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════╗
║                     REAL ESTATE DASHBOARD                                ║
║                   Quick Reference Card                                   ║
╚══════════════════════════════════════════════════════════════════════════╝

📦 CREATED STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

broker_intellj/
├── frontend/              # Next.js React App (Port 3000)
├── backend/               # FastAPI Python App (Port 8000)
├── agent/                 # Existing agent code
├── docker-compose.yml     # Docker stack
├── setup.sh              # Automated setup
└── Documentation files
    ├── README.md                    # Main documentation
    ├── SETUP_SUMMARY.md            # Setup overview ⭐ START HERE
    ├── GETTING_STARTED.md          # Step-by-step setup ⭐ THEN HERE
    ├── ARCHITECTURE.md              # System design
    ├── VISUAL_GUIDE.md             # Diagrams
    ├── PROJECT_STRUCTURE.md         # File organization
    ├── VERIFICATION_CHECKLIST.md   # Testing guide ⭐ VERIFY HERE
    └── DOCUMENTATION_INDEX.md      # This guide

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 QUICK START (Choose One)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Option 1: Docker (Easiest - 5 minutes)
──────────────────────────────────────
$ docker-compose up --build

Then visit:
  Frontend:  http://localhost:3000
  Backend:   http://localhost:8000/docs
  Neo4j:     http://localhost:7474

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Option 2: Manual Setup (15 minutes)
──────────────────────────────────────

Backend:
  $ cd backend
  $ python3 -m venv venv
  $ source venv/bin/activate
  $ pip install -r requirements.txt
  $ cp .env.example .env
  # Update .env with Neo4j credentials
  $ uvicorn app.main:app --reload

Frontend (new terminal):
  $ cd frontend
  $ npm install
  $ echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
  $ npm run dev

Then visit:
  Frontend:  http://localhost:3000
  Backend:   http://localhost:8000/docs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Start Here:
  ⭐ SETUP_SUMMARY.md          → Overview of what was created
  ⭐ GETTING_STARTED.md         → Detailed setup instructions
  ⭐ VERIFICATION_CHECKLIST.md  → Test your setup

Learn More:
  📖 ARCHITECTURE.md            → System design & database schema
  📖 VISUAL_GUIDE.md            → Diagrams and flows
  📖 PROJECT_STRUCTURE.md       → File organization
  📖 README.md                  → Complete documentation

Component Docs:
  🖥️  frontend/README.md         → Frontend setup & features
  ⚙️  backend/README.md          → Backend setup & API

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pages:
  ✅ Home Page           - People grid with pagination
  ✅ Person Detail       - Profile, deals, orgs, properties
  ✅ Deal Detail         - Deal info, parties, properties
  ✅ Organization Detail - Org info, members, deals, properties
  ✅ Property Detail     - Property info, owners, deals

API Endpoints:
  ✅ GET /api/people?page=1&limit=12  - List people
  ✅ GET /api/people/{id}             - Person details
  ✅ GET /api/deals/{id}              - Deal details
  ✅ GET /api/organizations/{id}      - Organization details
  ✅ GET /api/properties/{id}         - Property details

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾 DATABASE SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Neo4j Connection:
  URI:      bolt://localhost:7687
  Username: neo4j
  Password: password (default)

Sample Data (in Neo4j Browser or Cypher Shell):

  # Create Person
  CREATE (p:Person {id: 'person-1', name: 'John Doe', title: 'Agent'})

  # Create Organization
  CREATE (o:Organization {id: 'org-1', name: 'Acme Real Estate'})

  # Create Property
  CREATE (pr:Property {id: 'prop-1', address: '123 Main St', price: '500000'})

  # Create Deal
  CREATE (d:Deal {id: 'deal-1', title: 'House Sale', value: '500000'})

  # Create Relationships
  MATCH (p:Person {id: 'person-1'}), (o:Organization {id: 'org-1'})
  CREATE (p)-[:MEMBER_OF]->(o)

  MATCH (p:Person {id: 'person-1'}), (pr:Property {id: 'prop-1'})
  CREATE (p)-[:OWNS]->(pr)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛠️  TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend:
  • Next.js 14 (React framework)
  • React 18 (UI library)
  • TypeScript (type safety)
  • Tailwind CSS (styling)
  • Axios (HTTP client)

Backend:
  • FastAPI (web framework)
  • Python 3.10+ (language)
  • Pydantic (validation)
  • Neo4j (graph database)
  • Uvicorn (ASGI server)

Deployment:
  • Docker (containerization)
  • Docker Compose (orchestration)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After Setup, Check:

1. Frontend Loading
   $ curl http://localhost:3000/
   ✓ Page loads without errors

2. Backend Health
   $ curl http://localhost:8000/health
   ✓ Returns {"status": "ok"}

3. API Documentation
   $ curl http://localhost:8000/docs
   ✓ Swagger UI loads

4. Database Connection
   $ curl http://localhost:8000/api/people
   ✓ Returns people list (if data exists)

5. Browser Test
   Open: http://localhost:3000
   ✓ Home page loads
   ✓ Can navigate to detail pages

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❓ TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Port already in use?
  → Change port in startup command
  → Or kill process: lsof -i :3000

Neo4j connection failed?
  → Verify Neo4j is running
  → Check credentials in .env
  → Verify URI is correct

Frontend can't reach backend?
  → Verify backend is running
  → Check NEXT_PUBLIC_API_URL
  → Check browser console for CORS errors

See GETTING_STARTED.md for more troubleshooting tips!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 HELP & RESOURCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Documentation:
  • DOCUMENTATION_INDEX.md  - Complete guide to all docs
  • README.md              - Full project documentation
  • VERIFICATION_CHECKLIST.md - Complete testing guide

External Resources:
  • https://nextjs.org/docs             - Next.js docs
  • https://fastapi.tiangolo.com/       - FastAPI docs
  • https://neo4j.com/docs/            - Neo4j docs
  • https://tailwindcss.com/docs       - Tailwind docs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 YOU'RE ALL SET!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Steps:
  1. Read SETUP_SUMMARY.md for overview
  2. Follow GETTING_STARTED.md for setup
  3. Use VERIFICATION_CHECKLIST.md to test
  4. Review ARCHITECTURE.md to understand design
  5. Start building with your data!

Happy coding! 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

