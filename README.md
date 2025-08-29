# recipe-claude

# Recipe Management Application

A full-stack recipe management application built with React, Spring Boot, and PostgreSQL.

## Features

- Create, edit, and share recipes with ingredients and step-by-step instructions
- Google OAuth authentication
- Nutritional information calculation
- Recipe search and filtering
- Favorites system
- Public and private recipes
- Photo upload support

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Google Cloud Console project with OAuth 2.0 credentials

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd recipe002
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your actual values:
   - Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
   - Generate a secure JWT secret (recommended: 64+ character random string)

3. **Start the application**
   ```bash
   docker compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - Database: localhost:5433

### Development Commands

- **Start all services**: `docker compose up -d`
- **Stop all services**: `docker compose down`
- **Rebuild after changes**: `docker compose build [frontend|backend]`
- **View logs**: `docker compose logs [service-name]`

## Architecture

- **Frontend**: React TypeScript with Material-UI
- **Backend**: Spring Boot with JPA/Hibernate
- **Database**: PostgreSQL
- **Authentication**: Google OAuth 2.0 with JWT tokens

## Environment Variables

See `.env.example` for required environment variables. Never commit the actual `.env` file to version control.

## Security Notes

- All sensitive configuration is stored in environment variables
- Google OAuth credentials are required for authentication
- JWT secret should be a secure random string in production
- Database credentials should be changed from defaults in production

## Documentation

Comprehensive documentation is available in the `documentation/` directory:

- **[📚 Documentation Index](documentation/README.md)** - Complete documentation overview
- **[🏗️ System Architecture](documentation/architecture/system-overview.md)** - Technical architecture and design
- **[🗄️ Database Schema](documentation/database/schema.md)** - Data model and relationships  
- **[🔌 API Reference](documentation/api/endpoints.md)** - REST API documentation
- **[🎨 Frontend Guide](documentation/frontend/components.md)** - React component architecture
- **[🛠️ Development Workflow](documentation/development/workflow.md)** - Setup and daily development

For developers working with this codebase, start with the [Documentation Index](documentation/README.md).
# recipe-claude
