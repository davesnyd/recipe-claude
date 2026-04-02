# System Architecture Overview

## High-Level Architecture

The Recipe Management Application follows a three-tier architecture pattern:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React)       │◄───┤  (Spring Boot)  │◄───┤  (PostgreSQL)   │
│   Port 3000     │    │   Port 8080     │    │   Port 5433     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐             ┌────▼────┐             ┌────▼────┐
    │Material │             │Spring   │             │JPA/     │
    │UI       │             │Security │             │Hibernate│
    │OAuth    │             │JWT      │             │         │
    └─────────┘             └─────────┘             └─────────┘
```

## Technology Stack

### Frontend (React TypeScript)
- **Framework**: React 19.1 with TypeScript 4.9
- **UI Library**: Material-UI (MUI) v7.3
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Authentication**: Google OAuth 2.0
- **PDF Generation**: jsPDF with jsPDF-AutoTable
- **File Upload**: react-dropzone
- **Build Tool**: Create React App (React Scripts 5.0)
- **Container**: Docker with serve for static files

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Security**: Spring Security with OAuth2 and JWT (jjwt 0.11.5)
- **Data Access**: Spring Data JPA with Hibernate 6
- **API**: RESTful web services
- **File Upload**: Multipart file handling (max 10MB)
- **Build Tool**: Maven
- **Container**: Docker with embedded Tomcat

### Database (PostgreSQL)
- **Database**: PostgreSQL 15
- **Connection Pooling**: HikariCP (default with Spring Boot)
- **Migration**: Hibernate DDL auto-generation (development)
- **Container**: Docker official PostgreSQL image

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Networking**: Docker internal network with exposed ports
- **Data Persistence**: Docker volumes for database storage

## Authentication Flow

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│Frontend │                │Backend  │                │Google   │
│         │                │         │                │OAuth    │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ 1. Login Request          │                          │
     ├──────────────────────────►│                          │
     │                          │ 2. Redirect to Google    │
     │                          ├─────────────────────────►│
     │                          │                          │
     │ 3. OAuth Callback        │ 4. Validate with Google  │
     │◄─────────────────────────┤◄─────────────────────────┤
     │                          │                          │
     │ 5. JWT Token             │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
     │ 6. API Requests          │                          │
     │    (with JWT header)     │                          │
     ├──────────────────────────►│                          │
```

## Data Flow

### Recipe Creation/Update
1. Frontend collects recipe data (title, ingredients, steps)
2. Data sent to backend via REST API as JSON
3. Backend validates and converts to JPA entities
4. Hibernate persists to PostgreSQL with proper relationships
5. Success response returned to frontend

### Recipe Retrieval
1. Frontend requests recipe data via GET API
2. Backend queries database using JPA repositories
3. Hibernate loads entities with EAGER fetching for ingredients/steps
4. Data serialized to JSON with proper field names
5. Frontend receives and displays data

### Recipe Export
1. User selects export format (PDF, JSON-LD, RecipeML, or batch export)
2. Frontend generates export file using jsPDF or XML/JSON formatting
3. File is downloaded to user's device
4. Supports single recipe or batch export of multiple recipes

## Security Considerations

### Environment Variables
- Google OAuth credentials stored in `.env` file
- JWT secret configurable via environment variables
- Database credentials externalized
- CORS origins configurable for different environments

### Authentication & Authorization
- Google OAuth 2.0 for user authentication
- JWT tokens for session management
- Recipe ownership validation on CRUD operations
- Public/private recipe access control

### Data Validation
- Frontend: Form validation with Material-UI
- Backend: Bean validation annotations
- Database: Constraints and foreign keys

## Performance Considerations

### Database
- EAGER loading for recipe relationships (ingredients, steps)
- Indexed foreign keys for performance
- Connection pooling via HikariCP

### Caching
- Static frontend assets served with caching headers
- Database query optimization through JPA

### Scalability
- Stateless backend design (JWT tokens)
- Docker containerization for horizontal scaling
- Database connection pooling for concurrent users

## Error Handling

### Frontend
- Axios interceptors for global error handling
- Material-UI snackbars for user notifications
- Loading states and error boundaries

### Backend
- Global exception handlers with @ControllerAdvice
- Proper HTTP status codes
- Detailed error messages for debugging

### Database
- Transaction management via @Transactional
- Constraint violation handling
- Connection retry logic