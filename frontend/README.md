# Real Estate Due Diligence Agent

A property evaluation platform that automates the collection and analysis of public records, ownership history, tax data, and regulatory information for real estate due diligence.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Project Structure](#project-structure)
- [Milestone 2 Features](#milestone-2-features)
- [Team Members](#team-members)
- [License](#license)

---

## 🛠️ Tech Stack

### Backend

- Java 21
- Spring Boot 3.x
- Spring MVC
- Spring Data JPA
- Spring Security
- JWT / OAuth2

### Frontend

- React.js
- Next.js
- Tailwind CSS

### Database & Cache

- PostgreSQL 18
- Redis

### Infrastructure

- Docker
- GitHub Actions
- Nginx
- AWS / Azure

### Libraries

- Hibernate
- Lombok
- MapStruct
- OpenAPI (Swagger)
- JasperReports / iText PDF

---

## 📦 Setup Instructions

### Prerequisites

- Java 21
- Node.js 18+
- PostgreSQL 18
- Maven

### 1. Clone the Repository

```bash
git clone https://github.com/springboardmentor198/team-03.git
cd team-03
git checkout develop
```

### 2. Backend Setup

#### Environment Configuration

Create a `.env` file in the backend root directory:

```env
# Database
DB_URL=jdbc:postgresql://localhost:5432/due_diligence_db
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400000

# External APIs (Milestone 2)
PUBLIC_RECORDS_API_KEY=your_api_key
TAX_HISTORY_API_URL=https://api.taxservice.com/v1
FLOOD_ZONE_API_URL=https://api.floodzone.gov/v1
ZONING_API_URL=https://api.zoningdata.com/v1
ENVIRONMENTAL_API_URL=https://api.environmental.gov/v1
PERMIT_API_URL=https://api.permitrecords.com/v1

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### Run Backend

```bash
cd backend
mvn spring-boot:run
```

The backend will start at `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:3000`

### 4. Database Setup

```bash
# Create PostgreSQL database
createdb due_diligence_db

# Hibernate will auto-create tables on application startup
```

---

## 📁 Project Structure

```
team-03/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/due_diligence/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── model/
│   │   │   │   ├── dto/
│   │   │   │   ├── exception/
│   │   │   │   └── util/
│   │   │   └── resources/
│   │   └── test/
│   ├── Dockerfile
│   ├── pom.xml
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── docs/
    └── API.md
```

---

## 🏗️ Milestone 2 Features

### Property Information Aggregation

The system now automatically retrieves and consolidates property data from multiple public sources:

- **Ownership Records** - Land registry and ownership history
- **Property Tax History** - Historical tax assessments and payments
- **Zoning Information** - Current zoning classifications and regulations
- **Flood Zone Verification** - FEMA flood zone designations
- **Building Permits** - Historical permit records
- **Environmental Records** - Environmental hazard information

### External API Integration

- Integrated with public land registry services
- Tax history API connectivity
- Flood zone data retrieval
- Zoning information services
- Permit record systems
- Environmental record services

### Data Management

- Automated data aggregation workflows
- Database storage for all retrieved information
- API exception handling and retry mechanisms
- Data synchronization reliability

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📚 Additional Documentation

- [API Documentation](docs/API.md) - Complete API reference with request/response examples

---

## 🚀 Next Steps (Milestone 3)

The upcoming milestone will focus on:

- Risk Assessment module implementation
- Comparable Property Analysis
- Due Diligence Report generation
- PDF and Excel export functionality
- Notification services
- Audit logging and dashboards

---

**For detailed API documentation, refer to [docs/API.md](docs/API.md)**
