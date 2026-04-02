# Frontend Component Guide

## Architecture Overview

The frontend is built with React 19.1 and TypeScript 4.9, following a component-based architecture with:
- **Pages**: Top-level route components
- **Components**: Reusable UI components
- **Contexts**: Global state management
- **Services**: API communication layer
- **Types**: TypeScript interfaces
- **Material-UI v7.3**: Modern UI component library with theming

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
Main dashboard showing user's recipes with navigation tabs and export functionality.

**Features**:
- Tab navigation (My Recipes, Favorites, All Recipes)
- Recipe table integration
- Create new recipe button
- Search and filter capabilities
- **Batch Export**: Export multiple recipes at once in various formats
  - PDF format with formatted recipe cards
  - JSON-LD (schema.org Recipe format)
  - RecipeML (XML-based recipe format)
- Export dialog with format selection
- Keyboard navigation support (Ctrl+Enter to submit forms)

**State Management**:
```typescript
const [activeTab, setActiveTab] = useState(0);
const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
const [publicRecipes, setPublicRecipes] = useState<Recipe[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [exportDialogOpen, setExportDialogOpen] = useState(false);
const [exportFormat, setExportFormat] = useState<'pdf' | 'jsonld' | 'recipeml'>('pdf');
```

**Export Functionality**:
- PDF: Uses jsPDF and jsPDF-AutoTable for formatted output
- JSON-LD: Structured data format for search engines
- RecipeML: XML-based recipe exchange format

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
- **Ingredient preparation field**: Optional field for preparation instructions (e.g., "chopped", "sifted")
- **Optional quantities**: Support for "to taste" ingredients without specified amounts
- **Keyboard navigation**: Ctrl+Enter submits ingredient/instruction entries
- Drag-and-drop reordering for ingredients and steps
- Form validation
- Image upload support via react-dropzone
- File upload for recipe and step photos

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
- Supports multipart file uploads for photos (max 10MB)

### RecipeViewPage.tsx
Display detailed recipe information in a readable format with export options.

**Features**:
- Recipe metadata display (title, author, servings)
- Ingredients list with quantities, units, and preparation instructions
- Step-by-step instructions with numbering
- Favorite/unfavorite functionality
- Edit button for recipe owners
- **Export functionality**: Download recipe in multiple formats
  - **PDF**: Formatted recipe card with all details
  - **JSON-LD**: schema.org Recipe format for SEO
  - **RecipeML**: XML-based recipe exchange format
- Nutritional information display
- Photo display for recipes and steps

**Key Implementation**:
- Handles field name mapping from backend (`recipeIngredients` → display)
- Permission-based UI (edit only for owners)
- Responsive layout for mobile devices
- Client-side export generation (no server dependency)

**Export Formats**:
```typescript
// PDF: jsPDF with formatted layout
// JSON-LD: schema.org/Recipe structured data
// RecipeML: XML format for recipe exchange
```

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

**RecipeIngredient**:
```typescript
interface RecipeIngredient {
  recipeIngredientId?: number;
  ingredientName: string;
  quantity?: number;                // Optional for "to taste" ingredients
  measurementName: string;
  preparation?: string;              // Optional preparation instruction
  ingredientOrder: number;
}
```

**Important**: Note the field name discrepancy between frontend types (`ingredients`, `steps`) and backend response (`recipeIngredients`, `recipeSteps`). Frontend code uses type assertions like `(recipe as any).recipeIngredients` to handle this.

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

### Material-UI v7.3 Integration
- Custom theme defined in `theme.ts`
- **Maroon and cream color scheme**: Brand colors consistently applied
  - Primary: Maroon (#800000)
  - Secondary: Cream (#FFFDD0)
- Responsive breakpoints configured
- Typography scales defined
- Emotion-based styling system

### Component Styling
- Uses Material-UI's `sx` prop for inline styling
- Theme-aware color and spacing via emotion
- Responsive design utilities
- Icon library: @mui/icons-material v7.3

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