# Frontend Component Guide

## Architecture Overview

The frontend is built with React TypeScript and follows a component-based architecture with:
- **Pages**: Top-level route components
- **Components**: Reusable UI components  
- **Contexts**: Global state management
- **Services**: API communication layer
- **Types**: TypeScript interfaces

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main app layout wrapper
│   ├── GoogleLoginButton.tsx  # OAuth login component
│   └── RecipeTable.tsx # Recipe listing component
├── pages/              # Route components
│   ├── HomePage.tsx    # Dashboard/recipe list
│   ├── LoginPage.tsx   # Authentication page
│   ├── RecipeEditPage.tsx  # Create/edit recipes
│   ├── RecipeViewPage.tsx  # View recipe details
│   └── TestPage.tsx    # Development testing
├── contexts/           # React Context providers
│   └── AuthContext.tsx # Authentication state
├── services/           # API layer
│   └── api.ts         # HTTP client and endpoints
├── types/              # TypeScript definitions
│   └── index.ts       # Interface definitions
├── App.tsx            # Root component with routing
├── theme.ts           # Material-UI theme
└── index.tsx          # App entry point
```

## Core Components

### Layout.tsx
Main application wrapper providing consistent navigation and structure.

**Props**: 
```typescript
interface LayoutProps {
  children: React.ReactNode;
}
```

**Features**:
- Material-UI AppBar with navigation
- User authentication status display
- Responsive sidebar/drawer navigation
- Logout functionality
- Consistent page styling

**Usage**:
```tsx
<Layout>
  <YourPageContent />
</Layout>
```

### GoogleLoginButton.tsx  
Handles Google OAuth 2.0 authentication integration.

**Features**:
- Google OAuth initialization
- Login button with Google branding
- Token management
- Error handling for auth failures

**Integration**:
- Uses Google Identity Services library
- Integrates with AuthContext for state management
- Handles JWT token storage

### RecipeTable.tsx
Displays recipes in a tabular format with actions.

**Props**:
```typescript
interface RecipeTableProps {
  recipes: Recipe[];
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipeId: number) => void;
  onView?: (recipe: Recipe) => void;
  showActions?: boolean;
}
```

**Features**:
- Material-UI DataGrid integration
- Recipe metadata display
- Action buttons (Edit, Delete, View)
- Sorting and filtering capabilities
- Responsive design

## Page Components

### HomePage.tsx
Main dashboard showing user's recipes with navigation tabs.

**Features**:
- Tab navigation (My Recipes, Favorites, All Recipes)
- Recipe table integration
- Create new recipe button
- Search and filter capabilities

**State Management**:
```typescript
const [activeTab, setActiveTab] = useState(0);
const [recipes, setRecipes] = useState<Recipe[]>([]);
const [isLoading, setIsLoading] = useState(true);
```

### LoginPage.tsx
Authentication entry point for the application.

**Features**:
- Google OAuth integration
- Welcome message and branding
- Redirect handling after successful login
- Error message display

### RecipeEditPage.tsx
Create and edit recipe form with dynamic ingredients/steps.

**Key Features**:
- Dynamic form with add/remove ingredients
- Dynamic cooking steps management
- Form validation
- Auto-save drafts (if implemented)
- Image upload support (placeholder)

**State Management**:
```typescript
const [recipe, setRecipe] = useState<Partial<Recipe>>();
const [ingredients, setIngredients] = useState<CreateRecipeIngredient[]>();
const [steps, setSteps] = useState<Partial<RecipeStep>[]>();
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Important Notes**:
- Handles both create (new recipe) and edit (existing recipe) modes
- Uses different field names for backend compatibility (`recipeIngredients` vs `ingredients`)
- Implements proper form validation

### RecipeViewPage.tsx  
Display detailed recipe information in a readable format.

**Features**:
- Recipe metadata display (title, author, servings)
- Ingredients list with quantities and units
- Step-by-step instructions with numbering
- Favorite/unfavorite functionality
- Edit button for recipe owners
- Print and share actions (placeholder)

**Key Implementation**:
- Handles field name mapping from backend (`recipeIngredients` → display)
- Permission-based UI (edit only for owners)
- Responsive layout for mobile devices

## Context Providers

### AuthContext.tsx
Global authentication state management.

**Provides**:
```typescript
interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}
```

**Features**:
- JWT token storage in localStorage  
- User profile management
- Login/logout state management
- Protected route handling

## Services

### api.ts
Centralized HTTP client for all backend communication.

**Structure**:
```typescript
// Base configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// API endpoints grouped by domain
export const recipeApi = {
  searchRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  // ... other methods
};
```

**Features**:
- Axios interceptors for authentication
- Error handling and retry logic  
- Request/response logging (development)
- TypeScript integration with interfaces

## Type Definitions

### Core Interfaces
Located in `types/index.ts`:

**User**:
```typescript
interface User {
  userId: number;
  username: string;
  measurementPreference: 'Imperial' | 'Metric';
  createdAt: string;
}
```

**Recipe**:
```typescript
interface Recipe {
  recipeId: number;
  title: string;
  description?: string;
  servingCount: number;
  isPublic: boolean;
  creationDate: string;
  createUsername: string;
  photoUrl?: string;
  note?: string;
  ingredients: RecipeIngredient[];  // Frontend expects this field name
  steps: RecipeStep[];              // Frontend expects this field name
}
```

**Important**: Note the field name discrepancy between frontend types (`ingredients`, `steps`) and backend response (`recipeIngredients`, `recipeSteps`).

## State Management Patterns

### Local Component State
Most components use React's `useState` for local state:
- Form inputs and validation
- Loading states
- Local UI state (modals, tabs)

### Context for Global State  
AuthContext manages application-wide authentication state:
- Current user information
- Login/logout actions
- Authentication token

### API State Management
Currently uses direct API calls with local state. Consider implementing:
- React Query for server state caching
- SWR for data fetching
- Redux for complex state management

## Styling and Theming

### Material-UI Integration
- Custom theme defined in `theme.ts`
- Maroon and cream color scheme
- Responsive breakpoints configured
- Typography scales defined

### Component Styling
- Uses Material-UI's `sx` prop for inline styling
- Theme-aware color and spacing
- Responsive design utilities

## Development Patterns

### Error Handling
```typescript
try {
  const response = await api.getRecipe(id);
  setRecipe(response.data);
} catch (error) {
  setError('Failed to load recipe');
  console.error('API Error:', error);
}
```

### Loading States  
```typescript
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  loadData().finally(() => setIsLoading(false));
}, []);

if (isLoading) return <CircularProgress />;
```

### Form Validation
Material-UI components with built-in validation:
```typescript
<TextField
  required
  error={!!errors.title}
  helperText={errors.title}
  onChange={(e) => handleChange('title', e.target.value)}
/>
```

## Best Practices

### Component Organization
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for all props
- Implement proper error boundaries

### Performance  
- Use React.memo for expensive components
- Implement proper key props for lists
- Lazy load routes and heavy components
- Optimize re-renders with useCallback/useMemo

### Accessibility
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Material-UI accessibility features

### Testing
- Unit tests for utility functions
- Component testing with React Testing Library
- Integration tests for user flows
- Mock API responses for consistent testing