# recipe-claude

# Recipe Management Application

A full-stack recipe management application built with React, Spring Boot, and PostgreSQL.

## Features

- Create, edit, and share recipes with ingredients and step-by-step instructions
- Google OAuth authentication
- Nutritional information calculation
- Recipe search and filtering (title, description, ingredients, category, cuisine, holiday, course, type)
- Sortable recipe table with multi-column sort
- Favorites system
- Public and private recipes
- Photo upload support
- Export recipes as PDF, RecipeML (XML), or JSON-LD with custom filename

## Quick Start

### Prerequisites

#### Required packages

| Package | Minimum version | Purpose |
|---|---|---|
| Docker Engine | 24+ | Runs all three services (frontend, backend, database) |
| Docker Compose plugin | v2 (`docker compose`) | Orchestrates the multi-container setup |
| Node.js | 20+ | Running frontend tests locally (`npx react-scripts test`) |
| npm | 10+ | Installing frontend dependencies |
| Java (JDK) | 21 | Running backend tests locally (`mvn test`) |
| Maven | 3.8+ | Building and testing the backend locally |

**To run the application** only Docker and Docker Compose are required — Node.js, npm, Java, and Maven are only needed when running tests outside of Docker.

**Linux Mint / Ubuntu 24.04 installation:**

**Docker Engine + Compose plugin**
```bash
# Install prerequisites
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu jammy stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker and enable on boot
sudo systemctl start docker
sudo systemctl enable docker

# Allow your user to run Docker without sudo
sudo usermod -aG docker $USER
```

Apply the group change without logging out:
```bash
newgrp docker
```

Or log out and back in, then verify Docker works:
```bash
docker run hello-world
```

**Node.js 20 + npm**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify (npm is bundled with Node.js):
```bash
node --version
npm --version
```

**Java 21 (JDK)**
```bash
sudo apt update
sudo apt install -y openjdk-21-jdk
```

Verify:
```bash
java --version
```

**Maven**
```bash
sudo apt install -y maven
```

Verify:
```bash
mvn --version
```

#### Other requirements

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
   ./startup.sh
   ```
   This starts all services, checks status, and tails the logs. Alternatively, use `./start.sh` to start services without log output:
   ```bash
   ./start.sh
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - Database: localhost:5433

5. **Stop the application**
   ```bash
   ./shutdown.sh
   ```
   Stops and removes containers while preserving data in the `postgres_data` Docker volume.

### Development Commands

Start with logs:
```bash
./startup.sh
```

Start quietly:
```bash
./start.sh
```

Stop:
```bash
./shutdown.sh
```

Rebuild after code changes:
```bash
docker compose build frontend
docker compose build backend
```

View logs:
```bash
docker compose logs -f
docker compose logs frontend
docker compose logs backend
```

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
