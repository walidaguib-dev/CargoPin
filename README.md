# CargoPin 🚢

> Real-time GPS-based cargo positioning system for port operations.

Built by a tallyman working at Djen Djen Port, Algeria — solving a real 
operational problem with real domain knowledge.

![Status](https://img.shields.io/badge/Backend-Almost%20Ready-orange)
![Status](https://img.shields.io/badge/Dashboard-In%20Progress-blue)
![Status](https://img.shields.io/badge/Mobile%20App-In%20Progress-blue)
![Stack](https://img.shields.io/badge/Stack-ASP.NET%20Core%2010-purple)
![Stack](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20PostGIS-blue)

---

## The Problem

Port tallymen currently track cargo positions manually — paper, memory, 
radio calls. When a client asks "where are my steel coils?", the answer 
takes 20 minutes and two phone calls.

CargoPin replaces this with a GPS-based system where the answer 
takes 3 seconds.

---

## How It Works

```
Vessel docks at port
       ↓
Tallyman stands next to cargo in the field
       ↓
Opens mobile app → GPS captured automatically
       ↓
Assigns cargo to area → photo taken
       ↓
Position saved in real-time
       ↓
Admin sees it on the map instantly
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                      Clients                         │
│                                                      │
│   Next.js Dashboard        React Native Expo App     │
│   Admin / Port Supervisor   Tallyman / Field Work    │
│   (In Progress 🔨)          (In Progress 🔨)         │
└──────────────┬──────────────────────┬───────────────┘
               │                      │
               ▼                      ▼
┌─────────────────────────────────────────────────────┐
│                ASP.NET Core 10 API                   │
│                                                      │
│   GraphQL (reads)        REST Minimal APIs           │
│   Hot Chocolate          (mutations)                 │
│                                                      │
│   Clean Architecture + CQRS + MediatR                │
└──────────┬───────────────────────┬──────────────────┘
           │                       │
  ┌────────▼────────┐    ┌────────▼────────┐
  │   PostgreSQL     │    │     Redis        │
  │   + PostGIS      │    │  + FusionCache   │
  │   Polygons +     │    │  Tag-based       │
  │   GPS Points     │    │  Invalidation    │
  └─────────────────┘    └─────────────────┘
           │
  ┌────────▼────────┐
  │    Hangfire      │
  │  Background Jobs │
  │  Demurrage Alerts│
  └─────────────────┘
```

---

## Domain Model

```
Zone  (Hangar 6000, General Cargo, West Zone...)
  └── Area  (physical space with PostGIS polygon boundary)
        └── MerchandiseAreaPosition  (cargo here RIGHT NOW)
              └── PositionHistory  (every move, append-only)

Vessel  (Bao Nico, Ocean Feather...)
  └── Client  (Houdna Metal, SGT, Enafor...)
        └── Merchandise  (Steel Coils, Big Bag, Colis...)
              └── MerchandiseAreaPosition
```

---

## Tech Stack

### Backend (Almost Ready ✅)

| Technology | Purpose |
|---|---|
| ASP.NET Core 10 | API framework |
| Clean Architecture + CQRS + MediatR | Project structure |
| PostgreSQL + PostGIS | Database + geographic data |
| Entity Framework Core 10 | ORM |
| Hot Chocolate | GraphQL server |
| FusionCache + Redis | Distributed caching + tag invalidation |
| Hangfire | Background jobs + demurrage alerts |
| Cloudinary | Photo uploads from field |
| JWT + Refresh Tokens | Authentication |
| FluentValidation | Input validation |
| Serilog | Structured logging |
| Docker / Podman | Containerization |

### Next.js Dashboard (In Progress 🔨)

| Technology | Purpose |
|---|---|
| Next.js 15 | Admin dashboard framework |
| Leaflet.js | Interactive port map |
| React Leaflet | Map components |
| Leaflet Draw | Draw zone and area polygons |
| TailwindCSS | Styling |

Features planned:
- Live map with color-coded areas (green/yellow/red)
- Draw port zones and areas directly on map
- Track all cargo positions in real time
- Cargo history timeline per merchandise
- Demurrage alerts dashboard
- Search by BL number
- Export position report to PDF

### React Native Expo App (In Progress 🔨)

| Technology | Purpose |
|---|---|
| React Native Expo | Tallyman mobile app |
| react-native-maps | Map rendering |
| Expo Location | GPS auto-capture |
| Expo Camera | Photo capture |

Features planned:
- Assign cargo to area (GPS captured automatically)
- Photo upload via Cloudinary
- Voice notes on positions
- Offline mode with sync
- Search by BL number
- View active assignments

---

## Key Features

### Geographic Positioning
- Port areas stored as **PostGIS polygons** — drawn once by admin on Leaflet map
- Cargo positions stored as **PostGIS points** — GPS captured automatically
- `ST_Contains` validation — ensures tallyman is physically inside the area
- GeoJSON endpoint — plugs directly into Leaflet and react-native-maps

### Data Integrity
- Position history is **append-only** — every move recorded, nothing deleted
- Soft deletes on positions — `IsActive` flag + `ClosedAt` timestamp
- Emergency placement flag — tracks mixed cargo due to space constraints
- Full audit trail with tallyman identity on every action

### Performance
- FusionCache with **tag-based invalidation**
- Write-behind caching via Hangfire
- `AsNoTracking` on all read queries
- GIST spatial index on polygon boundaries
- GraphQL projections — fetch only what you need

### API Design
- **GraphQL** for reads — filtering, sorting, pagination, projections
- **REST** for mutations — clear contracts, simple validation
- Rate limiting on all endpoints
- Structured error handling

---

## Project Structure

```
CargoPin/
├── Backend/
│   ├── Domain/           # Entities, enums
│   ├── Application/      # CQRS commands/queries, DTOs, validators
│   ├── Infrastructure/   # EF Core, repositories, external services
│   └── API/              # Minimal APIs, GraphQL, middleware
│
├── Dashboard/            # Next.js admin dashboard (in progress)
│
└── MobileApp/            # React Native Expo app (in progress)
```

---

## API Overview

### REST Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh

GET    /api/vessels
POST   /api/vessels
PUT    /api/vessels/{id}
DELETE /api/vessels/{id}

GET    /api/zones
POST   /api/zones

GET    /api/areas
POST   /api/areas
GET    /api/areas/geojson       ← PostGIS polygons as GeoJSON

GET    /api/clients
POST   /api/clients

GET    /api/merchandises
POST   /api/merchandises

POST   /api/positions           ← assign cargo to area
PUT    /api/positions/{id}      ← move cargo
DELETE /api/positions/{id}      ← release cargo
GET    /api/positions/geojson   ← all positions as GeoJSON
```

### GraphQL
```graphql
# Get all vessels with filtering
query {
  vessels(where: { status: { eq: BERTHED } }
          order: { arrivalDate: DESC }) {
    nodes {
      id
      name
      arrivalDate
      clients {
        name
        blNumbers
        merchandise { description }
      }
    }
  }
}

# Get all positions in an area
query {
  positions(where: { areaId: { eq: "your-area-id" }
                     isActive: { eq: true } }) {
    nodes {
      client { name blNumbers }
      merchandise { description cargoType }
      area { name zone { name } }
      vessel { name }
      placedAt
      isEmergencyPlacement
    }
  }
}
```

---

## Local Setup

### Prerequisites
- .NET 10 SDK
- Podman or Docker
- Node.js 20+

### 1. Clone the repository
```bash
git clone https://github.com/walidaguib-dev/CargoPin.git
cd CargoPin/Backend
```

### 2. Configure environment
Create a `.env` file:
```env
ConnectionStrings__Default=Host=db;Port=5432;Database=CargoPin;Username=postgres;Password=postgres
JWT__Issuer=http://localhost:5005
JWT__Audience=http://localhost:5005
JWT__Key=your-secret-key-at-least-256-bits
JWT__AccessTokenExpirationMinutes=15
JWT__RefreshTokenExpirationDays=7
RedisConnectionString=redis:6379
CloudinarySettings__CloudName=your-cloud-name
CloudinarySettings__ApiKey=your-api-key
CloudinarySettings__ApiSecret=your-api-secret
```

### 3. Start containers
```bash
podman-compose up -d
```

### 4. Run the API
```bash
cd API
dotnet run
```

### 5. Access
| Service | URL |
|---|---|
| API Documentation | http://localhost:5005/docs |
| GraphQL Playground | http://localhost:5005/graphql |
| Hangfire Dashboard | http://localhost:5005/hangfire |

---

## Background Jobs

| Job | Schedule | Purpose |
|---|---|---|
| Demurrage Alert | Daily | Flag cargo past storage deadline |
| Cache Warmup | On startup | Pre-load zones and areas into Redis |

---

## Roadmap

- [x] Authentication + JWT
- [x] File uploads + Cloudinary
- [x] User profiles
- [x] Vessels
- [x] Merchandises
- [x] Clients
- [x] Zones
- [x] Areas (PostGIS polygons)
- [ ] Merchandise positions (GPS points)
- [ ] Position history (audit trail)
- [ ] GeoJSON endpoints
- [ ] Next.js dashboard
- [ ] React Native Expo app
- [ ] Railway deployment
- [ ] Offline mode (mobile)
- [ ] PDF export

---

## Why CargoPin?

Most port cargo tracking is still done on paper or via radio.
CargoPin was built by someone who does this job daily —
a tallyman who knows exactly what information is needed,
when, and why.

The result is a system that matches real port operations,
not a generic warehouse management clone.

---

## Related Project

**[Tally Management System](https://github.com/walidaguib-dev/Tally-App)**
Port tally operations management — deployed to production.

---

## Author

**Walid Aguib**
Tallyman @ Djen Djen Port + Backend Developer
- 📧 Walidaguib@proton.me
- 🐙 [github.com/walidaguib-dev](https://github.com/walidaguib-dev)

> Building the exit with code. 🔨
