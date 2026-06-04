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
