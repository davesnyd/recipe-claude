# Docker Installation and Setup Guide

## Installing Docker on Ubuntu/Debian

### Method 1: Install Docker using apt (Recommended)

```bash
# Update package index
sudo apt update

# Install prerequisites
sudo apt install apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index again
sudo apt update

# Install Docker
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER

# Log out and log back in, or run:
newgrp docker
```

### Method 2: Quick Install Script (Alternative)

```bash
# Download and run Docker installation script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose plugin
sudo apt update
sudo apt install docker-compose-plugin
```

## Verify Installation

After installation, verify Docker is working:

```bash
# Check Docker version
docker --version

# Check Docker Compose version (note: no hyphen in newer versions)
docker compose version

# Test Docker installation
docker run hello-world
```

## Running the Recipe Application

Once Docker is installed, you can run the application:

### Option 1: Using Docker Compose V2 (Recommended - newer syntax)
```bash
cd /home/dms/Insync/davesnyd@gmail.com/Google\ Drive/Documents/development/recipe/recipe002

# Start the application
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop the application
docker compose down
```

### Option 2: Using Docker Compose V1 (Legacy syntax)
If you have the older docker-compose installed:
```bash
# Start the application
docker-compose up -d

# Check status  
docker-compose ps

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

## Troubleshooting

### Permission Issues
If you get permission denied errors:
```bash
# Add current user to docker group
sudo usermod -aG docker $USER

# Apply group changes (or log out/in)
newgrp docker

# Or run with sudo (not recommended for regular use)
sudo docker compose up -d
```

### Port Conflicts
If ports 3000, 8080, or 5432 are already in use:
```bash
# Check what's using the ports
sudo netstat -tlnp | grep -E ':(3000|8080|5432)'

# Stop conflicting services
sudo systemctl stop postgresql  # if PostgreSQL is running locally
sudo systemctl stop apache2     # if Apache is using port 8080

# Or modify docker-compose.yml to use different ports
```

### Memory/Disk Space Issues
```bash
# Check disk space
df -h

# Check Docker disk usage
docker system df

# Clean up Docker resources if needed
docker system prune -a --volumes
```

## Alternative: Running Without Docker

If you prefer not to use Docker, you can run each component separately:

### 1. Install and Setup PostgreSQL
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres createdb recipe_app
sudo -u postgres createuser recipe_user
sudo -u postgres psql -c "ALTER USER recipe_user PASSWORD 'recipe_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE recipe_app TO recipe_user;"

# Run the database schema
cd /home/dms/Insync/davesnyd@gmail.com/Google\ Drive/Documents/development/recipe/recipe002
sudo -u postgres psql -d recipe_app -f database/init.sql
```

### 2. Install Java and Run Backend
```bash
# Install Java 17
sudo apt install openjdk-17-jdk maven

# Set environment variables
export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/recipe_app"
export SPRING_DATASOURCE_USERNAME="recipe_user"
export SPRING_DATASOURCE_PASSWORD="recipe_password"
export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Run backend
cd backend
./mvnw spring-boot:run
```

### 3. Install Node.js and Run Frontend
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Set environment variables
export REACT_APP_API_BASE_URL="http://localhost:8080/api"
export REACT_APP_GOOGLE_CLIENT_ID="your-google-client-id"

# Run frontend
cd frontend
npm install
npm start
```

## Recommended Approach

**For easiest setup:** Install Docker and use `docker compose up -d`

**For development:** Run components separately so you can make changes and see them immediately

## Next Steps

1. Install Docker using Method 1 above
2. Set up your Google OAuth credentials in `.env` file
3. Run `docker compose up -d` from the project directory
4. Access the application at http://localhost:3000

Need help with any of these steps? Let me know!