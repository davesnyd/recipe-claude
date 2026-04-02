# Development Workflow Guide

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Git
- Text editor/IDE (VS Code recommended)
- Google Cloud Console account (for OAuth credentials)

### Initial Setup

1. **Clone and configure**:
   ```bash
   git clone <repository-url>
   cd recipe002
   cp .env.example .env
   ```

2. **Configure environment variables**:
   Edit `.env` with your Google OAuth credentials:
   ```bash
   # Get from Google Cloud Console
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   
   # Generate secure random string (64+ characters)
   JWT_SECRET=your-secure-jwt-secret
   ```

3. **Start the application**:
   ```bash
   docker compose up -d
   ```

4. **Verify setup**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - Database: localhost:5433

## Daily Development Workflow

### Starting Development
```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs (optional)
docker compose logs -f
```

### Making Changes

#### Frontend Changes
1. Edit files in `frontend/src/`
2. Rebuild frontend container:
   ```bash
   docker compose build frontend
   docker compose restart frontend
   ```
3. Test changes at http://localhost:3000

#### Backend Changes
1. Edit files in `backend/src/`
2. Rebuild backend container:
   ```bash
   docker compose build backend  
   docker compose restart backend
   ```
3. Test API changes at http://localhost:8080/api

#### Database Changes

**Option 1: Using Hibernate Auto-Update (Current Development Mode)**
1. Edit JPA entity classes in `backend/src/main/java/com/recipe/model/`
2. Rebuild and restart backend:
   ```bash
   docker compose build backend
   docker compose restart backend
   ```
3. Hibernate will automatically update the schema on startup (ddl-auto: update)

**Option 2: Manual Schema Changes (Production Approach)**
1. Edit `database/init.sql` for schema changes
2. **Warning**: This requires recreating database:
   ```bash
   docker compose down
   docker volume rm recipe002_postgres_data
   docker compose up -d
   ```

**Note**: For production, consider using database migration tools like Flyway or Liquibase instead of Hibernate auto-updates.

### Stopping Development
```bash
# Stop all services (preserves data)
docker compose down

# Stop and remove everything including volumes
docker compose down -v
```

## Code Organization

### Adding New Features

#### Backend (Spring Boot)
1. **Entity**: Add JPA entity in `backend/src/main/java/com/recipe/model/`
2. **Repository**: Create repository interface in `backend/src/main/java/com/recipe/repository/`
3. **Service**: Add business logic in `backend/src/main/java/com/recipe/service/`
4. **Controller**: Create REST endpoints in `backend/src/main/java/com/recipe/controller/`
5. **DTO**: Add data transfer objects in `backend/src/main/java/com/recipe/dto/`

#### Frontend (React)
1. **Types**: Add TypeScript interfaces in `frontend/src/types/index.ts`
2. **API**: Add API methods in `frontend/src/services/api.ts`
3. **Components**: Create reusable components in `frontend/src/components/`
4. **Pages**: Add route components in `frontend/src/pages/`
5. **Context**: Add global state in `frontend/src/contexts/`

## Development Best Practices

### Code Standards

#### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use functional components with hooks
- Implement proper error handling

#### Java
- Follow Spring Boot conventions
- Use proper service layer pattern
- Implement validation with annotations
- Use @Transactional for database operations

### Git Workflow

#### Branch Naming
- `feature/recipe-search` - New features
- `bugfix/ingredient-validation` - Bug fixes  
- `refactor/api-cleanup` - Code refactoring
- `docs/api-documentation` - Documentation updates

#### Commit Messages
```bash
# Good commit messages
git commit -m "Add recipe search by ingredient functionality

- Implement ingredient-based search in RecipeRepository
- Add search endpoint to RecipeController  
- Update frontend search component with ingredient filter
- Add unit tests for search functionality"

# Bad commit messages
git commit -m "fix stuff"
git commit -m "updates"
```

#### Pull Request Process
1. Create feature branch from main
2. Make focused changes
3. Test thoroughly locally
4. Create pull request with description
5. Review and address feedback
6. Merge to main

### Testing Strategy

#### Backend Testing
```bash
# Run unit tests (if implemented)
cd backend
./mvnw test

# Test specific class
./mvnw test -Dtest=RecipeServiceTest
```

#### Frontend Testing  
```bash
# Run unit tests (if implemented)
cd frontend
npm test

# Run specific test
npm test -- --testNamePattern="Recipe"
```

#### Integration Testing
1. Start full stack: `docker compose up -d`
2. Test complete user flows through browser
3. Verify API responses with browser dev tools
4. Check database state for data consistency

### Debugging

#### Backend Debugging
```bash
# View backend logs
docker compose logs backend

# Debug specific errors
docker compose logs backend | grep ERROR

# Connect to database
docker exec -it recipe-postgres psql -U recipe_user -d recipe_app
```

#### Frontend Debugging  
```bash
# View frontend logs
docker compose logs frontend

# Rebuild with no cache if needed
docker compose build --no-cache frontend
```

#### Common Issues

**Field Name Mismatch**:
- Backend returns `recipeIngredients`, frontend expects `ingredients`
- Backend returns `recipeSteps`, frontend expects `steps`
- Use `(recipe as any).recipeIngredients` and `(recipe as any).recipeSteps` in frontend
- This is intentional to maintain JPA naming while supporting frontend conventions
- See CLAUDE.md for detailed explanation

**Authentication Issues**:
- Check Google OAuth credentials in `.env`
- Verify JWT token format and expiration
- Check CORS settings for frontend/backend communication

**Database Connection**:
- Ensure PostgreSQL container is running
- Check connection string in `application.yml`
- Verify network connectivity between containers

## Deployment

### Production Considerations

#### Environment Variables
- Generate secure JWT secret (64+ characters)
- Use production Google OAuth credentials
- Configure production database credentials
- Set appropriate CORS origins

#### Database
- Use proper database migrations (Flyway or Liquibase) instead of `ddl-auto: update`
- Change `ddl-auto` setting from `update` to `validate` in production
- Set up automated database backups
- Configure connection pooling for scale
- Consider read replicas for high traffic

#### Security  
- Enable HTTPS for production
- Configure secure headers
- Implement rate limiting
- Set up proper logging and monitoring

#### Docker Production
```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Run in production mode
docker compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Container Issues
```bash
# Check container status
docker compose ps

# Restart specific service
docker compose restart [service-name]

# View detailed logs
docker compose logs -f [service-name]

# Access container shell
docker exec -it recipe-backend bash
docker exec -it recipe-frontend sh
```

### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

### Database Issues
```bash
# Connect to database
docker exec -it recipe-postgres psql -U recipe_user -d recipe_app

# Check table structure
\dt
\d recipes

# View recent recipes
SELECT * FROM recipes ORDER BY creation_date DESC LIMIT 5;
```

## Code Review Checklist

### Before Submitting PR
- [ ] Code follows established patterns
- [ ] All console.log statements removed (except intentional logging)
- [ ] Error handling implemented
- [ ] TypeScript types properly defined
- [ ] No hardcoded values (use environment variables)
- [ ] Database migrations included if schema changed
- [ ] Documentation updated if API changes
- [ ] Manual testing completed

### Review Criteria
- [ ] Code is readable and maintainable
- [ ] Follows security best practices
- [ ] Performance considerations addressed
- [ ] Error cases handled gracefully
- [ ] Consistent with existing codebase style
- [ ] No sensitive information exposed

## Resources

### Documentation
- [Spring Boot Reference](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [Material-UI Components](https://mui.com/components/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

### Development Tools
- **VS Code Extensions**: ES7+ React/Redux/React-Native snippets, Java Extension Pack
- **Database Tools**: pgAdmin, DBeaver
- **API Testing**: Postman, Thunder Client
- **Git GUI**: GitKraken, SourceTree

### Community
- Stack Overflow for technical questions
- GitHub Issues for bug reports
- Spring Boot Discord/Forums
- React Community Discord