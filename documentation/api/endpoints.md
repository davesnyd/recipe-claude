# API Endpoints Documentation

## Base URL
All API endpoints are prefixed with `/api` (configured in `application.yml`)

**Development**: `http://localhost:8080/api`

## Authentication

All endpoints except login require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

JWT tokens are obtained through Google OAuth 2.0 authentication flow.

## Recipe Endpoints

### Search Recipes
Search for recipes with various filters.

**Endpoint**: `POST /api/recipes/search`  
**Authentication**: Required  
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "title": "string (optional)",
  "description": "string (optional)", 
  "note": "string (optional)",
  "createUsername": "string (optional)",
  "isPublic": "boolean (optional)",
  "startDate": "string (optional, ISO date)",
  "endDate": "string (optional, ISO date)",
  "ingredient": "string (optional)"
}
```

**Response**: `200 OK`
```json
[
  {
    "recipeId": 1,
    "title": "Chocolate Chip Cookies",
    "description": "Classic homemade cookies",
    "servingCount": 24,
    "isPublic": true,
    "createUsername": "user@example.com",
    "creationDate": "2024-01-15T10:30:00Z",
    "photoUrl": "http://example.com/photo.jpg",
    "note": "Best served warm",
    "recipeIngredients": [
      {
        "recipeIngredientId": 1,
        "quantity": 2.5,
        "ingredientName": "flour",
        "measurementName": "cup",
        "preparation": "sifted",
        "ingredientOrder": 1
      }
    ],
    "recipeSteps": [
      {
        "stepId": 1,
        "stepNumber": 1,
        "stepText": "Preheat oven to 375°F",
        "photoUrl": null
      }
    ]
  }
]
```

### Get My Recipes
Retrieve all recipes created by the authenticated user.

**Endpoint**: `GET /api/recipes/my`  
**Authentication**: Required

**Response**: `200 OK`
Returns an array of recipe objects with complete ingredient and step information.

### Get Favorite Recipes  
Retrieve all recipes favorited by the authenticated user.

**Endpoint**: `GET /api/recipes/favorites`  
**Authentication**: Required

**Response**: `200 OK`
Returns an array of recipe objects.

### Get Public Recipes
Retrieve all publicly visible recipes.

**Endpoint**: `GET /api/recipes/public`  
**Authentication**: Required

**Response**: `200 OK`
Returns an array of recipe objects.

### Get Recipe by ID
Retrieve a specific recipe by its ID.

**Endpoint**: `GET /api/recipes/{id}`  
**Authentication**: Required  
**Path Parameters**: 
- `id` (integer) - Recipe ID

**Response**: 
- `200 OK` - Recipe found and user has access
- `403 Forbidden` - User doesn't have access to private recipe
- `404 Not Found` - Recipe doesn't exist

**Response Body**: Single recipe object with complete details.

### Create Recipe
Create a new recipe with ingredients and steps.

**Endpoint**: `POST /api/recipes`  
**Authentication**: Required  
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "title": "Recipe Title",
  "description": "Optional description",
  "servingCount": 4,
  "isPublic": false,
  "note": "Optional cooking notes",
  "ingredients": [
    {
      "ingredientName": "flour",
      "quantity": 2.5,
      "measurementName": "cup",
      "preparation": "sifted"
    }
  ],
  "steps": [
    {
      "stepText": "Mix ingredients together",
      "photoUrl": "optional-photo-url"
    }
  ]
}
```

**Response**: `201 Created`
Returns the created recipe object with generated IDs.

### Update Recipe
Update an existing recipe (owner only).

**Endpoint**: `PUT /api/recipes/{id}`  
**Authentication**: Required  
**Path Parameters**:
- `id` (integer) - Recipe ID

**Request Body**: Same format as Create Recipe

**Response**:
- `200 OK` - Recipe updated successfully
- `403 Forbidden` - User is not the recipe owner
- `404 Not Found` - Recipe doesn't exist

### Delete Recipe
Delete a recipe (owner only).

**Endpoint**: `DELETE /api/recipes/{id}`  
**Authentication**: Required  
**Path Parameters**:
- `id` (integer) - Recipe ID

**Response**:
- `204 No Content` - Recipe deleted successfully
- `403 Forbidden` - User is not the recipe owner  
- `404 Not Found` - Recipe doesn't exist

### Mark as Favorite
Add a recipe to user's favorites.

**Endpoint**: `POST /api/recipes/{id}/favorite`  
**Authentication**: Required  
**Path Parameters**:
- `id` (integer) - Recipe ID

**Response**: `200 OK`

### Remove from Favorites
Remove a recipe from user's favorites.

**Endpoint**: `DELETE /api/recipes/{id}/favorite`  
**Authentication**: Required  
**Path Parameters**:
- `id` (integer) - Recipe ID

**Response**: `200 OK`

### Get Recipe Nutrition
Calculate and retrieve nutritional information for a recipe.

**Endpoint**: `GET /api/recipes/{id}/nutrition`  
**Authentication**: Required  
**Path Parameters**:
- `id` (integer) - Recipe ID

**Response**: `200 OK`
```json
{
  "calories": 450.25,
  "protein": 12.5,
  "fat": 18.0,
  "carbohydrates": 65.5,
  "fiber": 3.2,
  "sodium": 280.0
}
```

### Check if Recipe is Favorite
Check if a recipe is in the user's favorites.

**Endpoint**: `GET /api/recipes/{id}/is-favorite`  
**Authentication**: Required  
**Path Parameters**:
- `id` (integer) - Recipe ID

**Response**: `200 OK`
```json
true
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/recipes"
}
```

### 401 Unauthorized
```json
{
  "timestamp": "2024-01-15T10:30:00Z", 
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or missing JWT token",
  "path": "/api/recipes/my"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 403, 
  "error": "Forbidden",
  "message": "Access denied",
  "path": "/api/recipes/123"
}
```

### 404 Not Found
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 404,
  "error": "Not Found", 
  "message": "Recipe not found",
  "path": "/api/recipes/999"
}
```

### 500 Internal Server Error
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "path": "/api/recipes"
}
```

## Important Notes

### Field Name Mapping
- **Backend Response**: Uses `recipeIngredients` and `recipeSteps`  
- **Frontend Request**: Sends `ingredients` and `steps`
- **API Contract**: Controllers accept `Map<String, Object>` for flexibility

### Data Validation
- Recipe titles are required and cannot be blank
- Serving count must be positive
- Ingredient quantities must be positive  
- Step text cannot be blank

### Business Rules
- Users can only edit/delete their own recipes
- Users cannot favorite their own recipes
- Public recipes are visible to all authenticated users
- Private recipes are only visible to the owner

### Pagination
Currently, all endpoints return complete result sets. For production use, consider implementing pagination for large datasets.

### Rate Limiting
No rate limiting is currently implemented. Consider adding rate limiting for production deployment.

### File Upload
File upload is fully implemented via the FileController with multipart/form-data endpoints.

## Authentication Endpoints

### Google OAuth Login
Validate Google OAuth token and create/login user.

**Endpoint**: `POST /api/auth/google`
**Authentication**: Not Required
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "token": "google-oauth-token-string"
}
```

**Response**: `200 OK`
```json
{
  "token": "jwt-token-string",
  "user": {
    "userId": 1,
    "username": "user@example.com",
    "measurementPreference": "Imperial",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Current User
Retrieve authenticated user's profile information.

**Endpoint**: `GET /api/auth/me`
**Authentication**: Required

**Response**: `200 OK`
```json
{
  "userId": 1,
  "username": "user@example.com",
  "measurementPreference": "Imperial",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Update User Profile
Update authenticated user's profile settings.

**Endpoint**: `PUT /api/auth/me`
**Authentication**: Required
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "measurementPreference": "Metric"
}
```

**Response**: `200 OK`
Returns updated user object.

## File Management Endpoints

### Upload File
Upload a recipe or step photo.

**Endpoint**: `POST /api/files/upload`
**Authentication**: Required
**Content-Type**: `multipart/form-data`

**Request Parameters**:
- `file` - The image file to upload (max 10MB)

**Response**: `200 OK`
```json
{
  "filename": "unique-filename.jpg",
  "url": "http://localhost:8080/api/files/unique-filename.jpg"
}
```

**Error Responses**:
- `400 Bad Request` - File is empty or invalid
- `413 Payload Too Large` - File exceeds 10MB limit

### Get File
Retrieve an uploaded file.

**Endpoint**: `GET /api/files/{filename}`
**Authentication**: Required
**Path Parameters**:
- `filename` - The filename to retrieve

**Response**: `200 OK`
Returns the file as `application/octet-stream` with appropriate content disposition header.

**Error Responses**:
- `404 Not Found` - File doesn't exist

### Delete File
Delete an uploaded file.

**Endpoint**: `DELETE /api/files/{filename}`
**Authentication**: Required
**Path Parameters**:
- `filename` - The filename to delete

**Response**: `200 OK`

**Error Responses**:
- `404 Not Found` - File doesn't exist

## Ingredient Endpoints

### Get All Ingredients
Retrieve all available ingredients.

**Endpoint**: `GET /api/ingredients`
**Authentication**: Required

**Response**: `200 OK`
```json
[
  {
    "ingredientId": 1,
    "name": "flour",
    "density": 0.593,
    "calories": 364.0,
    "protein": 10.3,
    "fat": 1.0,
    "carbohydrates": 76.3,
    "dietaryFiber": 2.7,
    "sodium": 2.0,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Get Ingredient by ID
Retrieve a specific ingredient.

**Endpoint**: `GET /api/ingredients/{id}`
**Authentication**: Required
**Path Parameters**:
- `id` (integer) - Ingredient ID

**Response**: `200 OK`
Returns single ingredient object.

**Error Responses**:
- `404 Not Found` - Ingredient doesn't exist

### Search Ingredients
Search ingredients by name.

**Endpoint**: `GET /api/ingredients/search`
**Authentication**: Required
**Query Parameters**:
- `name` (string) - Search term for ingredient name

**Response**: `200 OK`
Returns array of matching ingredient objects.

### Create Ingredient
Create a new ingredient.

**Endpoint**: `POST /api/ingredients`
**Authentication**: Required
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "name": "sugar",
  "density": 0.85,
  "calories": 387.0,
  "protein": 0.0,
  "fat": 0.0,
  "carbohydrates": 99.8,
  "dietaryFiber": 0.0,
  "sodium": 1.0
}
```

**Response**: `201 Created`
Returns the created ingredient object.

## Measurement Endpoints

### Get All Measurements
Retrieve all available measurement units.

**Endpoint**: `GET /api/measurements`
**Authentication**: Required

**Response**: `200 OK`
```json
[
  {
    "measurementId": 1,
    "system": "Metric",
    "measurementName": "gram",
    "measurementType": "weight"
  },
  {
    "measurementId": 8,
    "system": "Imperial",
    "measurementName": "cup",
    "measurementType": "volume"
  }
]
```

### Get Measurements by System
Retrieve measurements for a specific unit system.

**Endpoint**: `GET /api/measurements/system/{system}`
**Authentication**: Required
**Path Parameters**:
- `system` - Either "Imperial" or "Metric"

**Response**: `200 OK`
Returns array of measurement objects for the specified system.

### Get Measurements by System and Type
Retrieve measurements for a specific system and type.

**Endpoint**: `GET /api/measurements/system/{system}/type/{type}`
**Authentication**: Required
**Path Parameters**:
- `system` - Either "Imperial" or "Metric"
- `type` - Either "weight" or "volume"

**Response**: `200 OK`
Returns array of measurement objects matching the criteria.