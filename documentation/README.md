# Recipe Management Application - Documentation

This directory contains comprehensive documentation for understanding and working with the Recipe Management Application codebase.

## 📚 Documentation Index

### 🏗️ Architecture & Design
- **[System Overview](architecture/system-overview.md)** - High-level architecture, technology stack, data flow, and security considerations
- **[Database Schema](database/schema.md)** - Complete database design, entity relationships, and business rules

### 🔌 API Reference  
- **[API Endpoints](api/endpoints.md)** - Complete REST API documentation with request/response examples and error handling

### 🎨 Frontend Development
- **[Component Guide](frontend/components.md)** - React component architecture, state management, and development patterns

### 🛠️ Development
- **[Workflow Guide](development/workflow.md)** - Setup instructions, daily workflows, debugging, and best practices

## 🚀 Quick Start

1. **New Developer Setup**:
   - Read [System Overview](architecture/system-overview.md) for understanding
   - Follow [Workflow Guide](development/workflow.md) for setup
   - Reference [API Endpoints](api/endpoints.md) for integration

2. **Database Work**:
   - Review [Database Schema](database/schema.md) for structure
   - Use entity relationship diagrams for planning changes
   - Follow migration patterns from workflow guide

3. **Frontend Development**:
   - Study [Component Guide](frontend/components.md) for patterns
   - Reference type definitions and state management examples
   - Follow established component structure

4. **Backend Development**:
   - Understand service layer patterns from system overview
   - Follow REST API conventions from endpoint documentation
   - Implement proper error handling and validation

## 🔍 Key Concepts

### Data Flow
```
Frontend (React) → API (Spring Boot) → Database (PostgreSQL)
```

### Authentication
- Google OAuth 2.0 for user authentication
- JWT tokens for API session management
- Protected routes and resource access control

### Field Name Mapping
⚠️ **Critical**: Backend uses `recipeIngredients`/`recipeSteps`, frontend expects `ingredients`/`steps`. See documentation for handling patterns.

### Docker Environment
- All services containerized with Docker Compose
- Development environment fully reproducible
- Volume persistence for database data

## 📖 Documentation Standards

### Structure
- Each major area has its own subdirectory
- Markdown format for all documentation  
- Code examples and diagrams where helpful
- Links between related concepts

### Maintenance
- Update documentation with code changes
- Keep examples current and tested
- Review and refactor documentation regularly
- Include troubleshooting for common issues

### Contributing
- Document new features as they're developed
- Include both design decisions and implementation details
- Provide examples for complex concepts
- Update this index when adding new documentation

## 🛡️ Security Notes

- Never commit sensitive information (`.env` files)
- Use `.env.example` for configuration templates
- Follow OAuth best practices for authentication
- Implement proper input validation and sanitization

## 📞 Support

For questions about the codebase or documentation:

1. **Check Documentation**: Start with relevant section above
2. **Review Code Comments**: In-line documentation in source files
3. **Check CLAUDE.md**: AI assistant guidance file
4. **Git History**: Review commit messages for context

## 🔧 Tools & Resources

### Development Tools
- **IDE**: VS Code with recommended extensions
- **Database**: PostgreSQL with pgAdmin/DBeaver
- **API Testing**: Postman or Thunder Client
- **Containers**: Docker Desktop

### External Documentation
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [Material-UI](https://mui.com/)
- [PostgreSQL Docs](https://postgresql.org/docs/)

---

*This documentation is maintained alongside the codebase. Last updated: 2024*