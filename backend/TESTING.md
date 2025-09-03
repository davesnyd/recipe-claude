# Backend Testing Guide

This guide explains how to run the comprehensive test suite for the Recipe Management Backend.

## Test Structure

The test suite includes:

### 1. Unit Tests
- **Service Tests**: Test business logic in isolation
  - `RecipeServiceTest.java` - Recipe CRUD operations, search, favorites, nutrition
  - `IngredientServiceTest.java` - Ingredient management operations  
  - `UserServiceTest.java` - User management and preferences
  
### 2. Integration Tests  
- **Controller Tests**: Test REST API endpoints with mocked services
  - `RecipeControllerTest.java` - Recipe API endpoints
  - `IngredientControllerTest.java` - Ingredient API endpoints
  
### 3. Repository Tests
- **Data Layer Tests**: Test JPA repositories with H2 in-memory database
  - `RecipeRepositoryTest.java` - Recipe data access and custom queries
  - `IngredientRepositoryTest.java` - Ingredient data access
  
### 4. Integration Tests
- **Full Integration**: End-to-end workflow testing
  - `RecipeIntegrationTest.java` - Complete recipe management workflows

## Test Configuration

### Database Setup
- Tests use **H2 in-memory database** for isolation
- Test data is automatically created and cleaned up
- Configuration in `application-test.yml`

### Security Setup  
- Uses mock authentication with `@WithMockUser`
- JWT token provider mocked for testing
- CSRF protection configured for test environment

### Test Utilities
- `TestDataBuilder.java` - Helper methods to create test entities
- `TestConfiguration.java` - Spring test configuration overrides

## Running Tests

### Prerequisites
Make sure Docker and Java 17+ are installed:
```bash
java -version
docker --version
```

### Option 1: Run in Docker Container (Recommended)

1. **Build and start the containers:**
```bash
sudo /tmp/docker-compose build backend
sudo /tmp/docker-compose up -d backend
```

2. **Run tests inside the container:**
```bash
# Run all tests
sudo docker exec recipe-backend mvn test

# Run specific test class  
sudo docker exec recipe-backend mvn test -Dtest=RecipeServiceTest

# Run tests with coverage report
sudo docker exec recipe-backend mvn test jacoco:report
```

### Option 2: Run Locally (Alternative)

If you have Maven installed locally:

1. **Set up test database (H2 will be used automatically)**

2. **Run all tests:**
```bash
cd backend
mvn test
```

3. **Run specific test categories:**
```bash
# Service tests only
mvn test -Dtest="*ServiceTest"

# Controller tests only  
mvn test -Dtest="*ControllerTest"

# Repository tests only
mvn test -Dtest="*RepositoryTest"

# Integration tests only
mvn test -Dtest="*IntegrationTest"
```

4. **Run with detailed output:**
```bash
mvn test -Dtest.output=true -Dspring.jpa.show-sql=true
```

## Test Reports

### Surefire Reports
After running tests, view HTML reports at:
```
backend/target/surefire-reports/index.html
```

### Coverage Reports (Optional)
To generate coverage reports, add JaCoCo plugin to pom.xml and run:
```bash
mvn test jacoco:report
```
View coverage at: `backend/target/site/jacoco/index.html`

## Test Categories Explained

### Unit Tests (`*ServiceTest.java`)
- **Fast execution** (no database/network calls)
- **Isolated testing** with mocked dependencies  
- **Business logic validation**
- Focus on service layer methods

### Controller Tests (`*ControllerTest.java`)
- **Web layer testing** with `@WebMvcTest`
- **Mock MVC** for HTTP request/response testing
- **Security integration** testing
- **JSON serialization/deserialization** validation

### Repository Tests (`*RepositoryTest.java`)
- **Data persistence** testing with `@DataJpaTest`
- **Custom query validation**
- **Entity relationship** testing
- **Database constraint** validation

### Integration Tests (`*IntegrationTest.java`)
- **End-to-end workflows**
- **Full Spring context** loading
- **Cross-layer integration**
- **Real database transactions**

## Troubleshooting

### Common Issues

1. **Port conflicts:**
```bash
# Check if ports are in use
netstat -tlnp | grep -E ':8080|:5432'
```

2. **Database connection issues:**
```bash
# Restart the database container
sudo /tmp/docker-compose restart postgres
```

3. **Docker permission issues:**
```bash
# Add user to docker group (requires logout/login)
sudo usermod -aG docker $USER
```

4. **Memory issues in Docker:**
```bash
# Increase Docker memory limits in Docker Desktop settings
# Or run specific tests instead of all tests
```

### Test-Specific Issues

1. **H2 Database not found:**
   - Ensure H2 dependency is in pom.xml
   - Check `application-test.yml` configuration

2. **Authentication failures:**
   - Verify `@WithMockUser` annotations
   - Check security configuration in test context

3. **Serialization errors:**
   - Verify Jackson configuration
   - Check entity annotations (@JsonIgnore, @JsonManagedReference)

## Test Data Management

### Test Database
- H2 in-memory database created for each test class
- Schema auto-generated from JPA entities  
- Data automatically cleaned between tests

### Test Data Creation
Use `TestDataBuilder` utility class:
```java
// Example usage in tests
Recipe testRecipe = TestDataBuilder.buildTestRecipe("Test Recipe", "testuser");
Ingredient ingredient = TestDataBuilder.buildTestIngredient("Flour", new BigDecimal("100"));
```

### Mock Data
Service tests use Mockito for mocking:
```java
@Mock
private RecipeRepository recipeRepository;

@InjectMocks  
private RecipeService recipeService;
```

## Continuous Integration

### GitHub Actions (Optional Setup)
Create `.github/workflows/test.yml`:
```yaml
name: Backend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK 17
        uses: actions/setup-java@v2
        with:
          java-version: '17'
      - name: Run tests
        run: cd backend && mvn test
```

## Test Coverage Goals

Aim for the following coverage targets:
- **Service Classes**: >90% line coverage
- **Controller Classes**: >80% line coverage  
- **Repository Classes**: >70% line coverage
- **Overall Project**: >80% line coverage

## Adding New Tests

When adding new features:

1. **Write unit tests first** (TDD approach)
2. **Add controller tests** for new endpoints
3. **Include repository tests** for new queries
4. **Create integration tests** for complex workflows
5. **Update this documentation** as needed

## Performance Testing

For load testing the API endpoints:
```bash
# Use Apache Bench (ab) or similar tools
ab -n 100 -c 10 http://localhost:8080/api/recipes/search

# Or use curl for basic endpoint testing  
curl -X POST http://localhost:8080/api/recipes/search \
  -H "Content-Type: application/json" \
  -d '{"title":"test"}'
```

---

**Happy Testing!** 🧪

For questions or issues, refer to the main project documentation or create an issue in the project repository.