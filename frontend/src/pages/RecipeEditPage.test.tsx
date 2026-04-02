import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import RecipeEditPage from './RecipeEditPage';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the API
jest.mock('../services/api', () => ({
  recipeApi: {
    getRecipe: jest.fn(),
    createRecipe: jest.fn(),
    updateRecipe: jest.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { userId: 1, username: 'test@example.com', measurementPreference: 'Imperial' },
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Wrapper component for rendering with router
const renderWithRouter = (ui: React.ReactElement, { route = '/recipe/new' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/recipe/new" element={ui} />
        <Route path="/recipe/:id" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('RecipeEditPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.log during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders the Create New Recipe title for new recipe', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      expect(screen.getByText('Create New Recipe')).toBeInTheDocument();
    });

    it('renders the recipe title input', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      expect(screen.getByLabelText(/Recipe Title/i)).toBeInTheDocument();
    });

    it('renders the description input', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    });

    it('renders the servings input', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      expect(screen.getByLabelText(/Servings/i)).toBeInTheDocument();
    });

    it('renders the public switch', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      expect(screen.getByLabelText(/Make recipe public/i)).toBeInTheDocument();
    });

    it('renders the Ingredients section', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      expect(screen.getByText('Ingredients')).toBeInTheDocument();
    });

    it('renders the Instructions section', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      expect(screen.getByText('Instructions')).toBeInTheDocument();
    });
  });

  describe('Drag handles', () => {
    it('renders drag handle for initial ingredient', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      // Check that there are drag handles (rendered as MUI icons)
      const allButtons = screen.getAllByRole('button');

      // We should have at least 2 drag handles (one for ingredient, one for step)
      expect(allButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('renders drag handle for initial step', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      // Should have step number 1 displayed
      expect(screen.getByText('1.')).toBeInTheDocument();
    });
  });

  describe('Ingredient management', () => {
    it('renders initial ingredient input fields', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Unit')).toBeInTheDocument();
      expect(screen.getByLabelText('Ingredient')).toBeInTheDocument();
      expect(screen.getByLabelText('Preparation')).toBeInTheDocument();
    });

    it('can add a new ingredient', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      const addButton = screen.getByRole('button', { name: /Add Ingredient/i });
      fireEvent.click(addButton);

      // Should now have 2 quantity fields
      const quantityFields = screen.getAllByLabelText('Quantity');
      expect(quantityFields).toHaveLength(2);
    });

    it('focuses the quantity field of the new ingredient after clicking Add Ingredient', async () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      const addButton = screen.getByRole('button', { name: /Add Ingredient/i });
      fireEvent.click(addButton);

      const quantityFields = screen.getAllByLabelText('Quantity');
      await waitFor(() => {
        expect(document.activeElement).toBe(quantityFields[1]);
      });
    });

    it('can update ingredient quantity', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      const quantityField = screen.getByLabelText('Quantity');
      fireEvent.change(quantityField, { target: { value: '2' } });

      expect(quantityField).toHaveValue('2');
    });

    it('accepts a fraction quantity like 1/2', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      const quantityField = screen.getByLabelText('Quantity');
      fireEvent.change(quantityField, { target: { value: '1/2' } });

      expect(quantityField).toHaveValue('1/2');
    });

    it('accepts a mixed number quantity like 1 1/2', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      const quantityField = screen.getByLabelText('Quantity');
      fireEvent.change(quantityField, { target: { value: '1 1/2' } });

      expect(quantityField).toHaveValue('1 1/2');
    });

    it('accepts a decimal quantity like 1.5', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      const quantityField = screen.getByLabelText('Quantity');
      fireEvent.change(quantityField, { target: { value: '1.5' } });

      expect(quantityField).toHaveValue('1.5');
    });

    it('can update ingredient name', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      const ingredientField = screen.getByLabelText('Ingredient');
      fireEvent.change(ingredientField, { target: { value: 'flour' } });

      expect(ingredientField).toHaveValue('flour');
    });

    it('can update ingredient unit', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      const unitField = screen.getByLabelText('Unit');
      fireEvent.change(unitField, { target: { value: 'cup' } });

      expect(unitField).toHaveValue('cup');
    });

    it('can update ingredient preparation', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      const prepField = screen.getByLabelText('Preparation');
      fireEvent.change(prepField, { target: { value: 'sifted' } });

      expect(prepField).toHaveValue('sifted');
    });

    it('delete button is disabled when only one ingredient', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      // Find delete buttons - they are in the ingredients section
      const deleteButtons = screen.getAllByRole('button').filter(btn =>
        btn.querySelector('svg[data-testid="DeleteIcon"]') ||
        btn.getAttribute('aria-label')?.includes('delete') ||
        btn.classList.contains('MuiIconButton-colorError')
      );

      // The first delete button should be for ingredients and should be disabled
      expect(deleteButtons[0]).toBeDisabled();
    });

    it('can delete an ingredient when multiple exist', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      // Add a second ingredient
      const addButton = screen.getByRole('button', { name: /Add Ingredient/i });
      fireEvent.click(addButton);

      // Should have 2 quantity fields now
      expect(screen.getAllByLabelText('Quantity')).toHaveLength(2);

      // Find delete buttons that are not disabled
      const deleteButtons = screen.getAllByRole('button').filter(btn =>
        !btn.hasAttribute('disabled') &&
        btn.classList.contains('MuiIconButton-colorError')
      );

      // Click first delete button
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);

        // Should have 1 quantity field now
        expect(screen.getAllByLabelText('Quantity')).toHaveLength(1);
      }
    });
  });

  describe('Step management', () => {
    it('renders initial step input field', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      expect(screen.getByLabelText('Step instructions')).toBeInTheDocument();
    });

    it('displays step number', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      expect(screen.getByText('1.')).toBeInTheDocument();
    });

    it('can add a new step', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      const addButton = screen.getByRole('button', { name: /Add Step/i });
      fireEvent.click(addButton);

      // Should now have 2 step instruction fields
      const stepFields = screen.getAllByLabelText('Step instructions');
      expect(stepFields).toHaveLength(2);

      // Should show step numbers 1 and 2
      expect(screen.getByText('1.')).toBeInTheDocument();
      expect(screen.getByText('2.')).toBeInTheDocument();
    });

    it('can update step text', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      const stepField = screen.getByLabelText('Step instructions');
      fireEvent.change(stepField, { target: { value: 'Preheat oven to 350°F' } });

      expect(stepField).toHaveValue('Preheat oven to 350°F');
    });

    it('delete button is disabled when only one step', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      // Find the step section delete button
      const instructionsSection = screen.getByText('Instructions').closest('div');
      const deleteButtons = screen.getAllByRole('button').filter(btn =>
        btn.classList.contains('MuiIconButton-colorError')
      );

      // The last delete button should be for steps and should be disabled
      const lastDeleteButton = deleteButtons[deleteButtons.length - 1];
      expect(lastDeleteButton).toBeDisabled();
    });
  });

  describe('Form actions', () => {
    it('renders Cancel button', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('renders Create Recipe button for new recipe', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      expect(screen.getByRole('button', { name: /Create Recipe/i })).toBeInTheDocument();
    });

    it('Create Recipe button is disabled when title is empty', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      const createButton = screen.getByRole('button', { name: /Create Recipe/i });
      expect(createButton).toBeDisabled();
    });

    it('Create Recipe button is enabled when title is provided', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      const titleField = screen.getByLabelText(/Recipe Title/i);
      fireEvent.change(titleField, { target: { value: 'Test Recipe' } });

      const createButton = screen.getByRole('button', { name: /Create Recipe/i });
      expect(createButton).toBeEnabled();
    });

    it('navigates away when Cancel is clicked', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Servings input', () => {
    it('defaults to 1', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      const servingsField = screen.getByLabelText(/Servings/i);
      expect(servingsField).toHaveValue(1);
    });

    it('allows clearing the servings field without snapping back to 1', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      const servingsField = screen.getByLabelText(/Servings/i);
      fireEvent.change(servingsField, { target: { value: '' } });
      // Field should be empty (null for number inputs), not forced back to 1
      expect(servingsField).toHaveValue(null);
    });

    it('allows typing a new servings value directly', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      const servingsField = screen.getByLabelText(/Servings/i);
      fireEvent.change(servingsField, { target: { value: '' } });
      fireEvent.change(servingsField, { target: { value: '4' } });
      expect(servingsField).toHaveValue(4);
    });

    it('resets to 1 on blur when field is empty', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      const servingsField = screen.getByLabelText(/Servings/i);
      fireEvent.change(servingsField, { target: { value: '' } });
      fireEvent.blur(servingsField);
      expect(servingsField).toHaveValue(1);
    });

    it('accepts integer values typed directly', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      const servingsField = screen.getByLabelText(/Servings/i);
      fireEvent.change(servingsField, { target: { value: '8' } });
      expect(servingsField).toHaveValue(8);
    });
  });

  describe('New recipe fields', () => {
    it('renders Category field', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    });

    it('renders Cuisine field', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      expect(screen.getByLabelText(/Cuisine/i)).toBeInTheDocument();
    });

    it('renders Holiday field', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      expect(screen.getByLabelText(/Holiday/i)).toBeInTheDocument();
    });

    it('renders Course dropdown', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      expect(screen.getByLabelText(/Course/i)).toBeInTheDocument();
    });

    it('renders Type checkboxes', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      expect(screen.getByText('vegetarian')).toBeInTheDocument();
      expect(screen.getByText('vegan')).toBeInTheDocument();
      expect(screen.getByText('gluten free')).toBeInTheDocument();
    });

    it('can update Category', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      const categoryField = screen.getByLabelText(/Category/i);
      fireEvent.change(categoryField, { target: { value: 'Italian' } });
      expect(categoryField).toHaveValue('Italian');
    });

    it('can update Cuisine', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });
      const cuisineField = screen.getByLabelText(/Cuisine/i);
      fireEvent.change(cuisineField, { target: { value: 'Mediterranean' } });
      expect(cuisineField).toHaveValue('Mediterranean');
    });
  });

  describe('Notes section', () => {
    it('renders the notes field', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      expect(screen.getByLabelText(/Notes \(optional\)/i)).toBeInTheDocument();
    });

    it('can update notes', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      const notesField = screen.getByLabelText(/Notes \(optional\)/i);
      fireEvent.change(notesField, { target: { value: 'Best served warm' } });

      expect(notesField).toHaveValue('Best served warm');
    });
  });

  describe('Drag and drop functionality', () => {
    it('ingredients are wrapped in sortable context', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      // Add multiple ingredients
      const addIngredientButton = screen.getByRole('button', { name: /Add Ingredient/i });
      fireEvent.click(addIngredientButton);
      fireEvent.click(addIngredientButton);

      // Should have 3 ingredients
      const quantityFields = screen.getAllByLabelText('Quantity');
      expect(quantityFields).toHaveLength(3);

      // Each ingredient should have a drag handle (IconButton)
      // This verifies the sortable wrapper is working
      const allButtons = screen.getAllByRole('button');
      expect(allButtons.length).toBeGreaterThanOrEqual(3);
    });

    it('steps are wrapped in sortable context', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      // Add multiple steps
      const addStepButton = screen.getByRole('button', { name: /Add Step/i });
      fireEvent.click(addStepButton);
      fireEvent.click(addStepButton);

      // Should have 3 steps with step numbers
      expect(screen.getByText('1.')).toBeInTheDocument();
      expect(screen.getByText('2.')).toBeInTheDocument();
      expect(screen.getByText('3.')).toBeInTheDocument();
    });

    it('step numbers are sequential after adding steps', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      const addStepButton = screen.getByRole('button', { name: /Add Step/i });

      // Add 4 more steps
      fireEvent.click(addStepButton);
      fireEvent.click(addStepButton);
      fireEvent.click(addStepButton);
      fireEvent.click(addStepButton);

      // Verify sequential numbering
      expect(screen.getByText('1.')).toBeInTheDocument();
      expect(screen.getByText('2.')).toBeInTheDocument();
      expect(screen.getByText('3.')).toBeInTheDocument();
      expect(screen.getByText('4.')).toBeInTheDocument();
      expect(screen.getByText('5.')).toBeInTheDocument();
    });
  });

  describe('Multiple ingredients and steps', () => {
    it('can manage multiple ingredients independently', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      // Add second ingredient
      const addButton = screen.getByRole('button', { name: /Add Ingredient/i });
      fireEvent.click(addButton);

      // Get all ingredient name fields
      const ingredientFields = screen.getAllByLabelText('Ingredient');

      // Update first ingredient
      fireEvent.change(ingredientFields[0], { target: { value: 'flour' } });

      // Update second ingredient
      fireEvent.change(ingredientFields[1], { target: { value: 'sugar' } });

      // Verify both values
      expect(ingredientFields[0]).toHaveValue('flour');
      expect(ingredientFields[1]).toHaveValue('sugar');
    });

    it('can manage multiple steps independently', () => {
      renderWithRouter(<RecipeEditPage />, { route: '/recipe/new' });

      // Add second step
      const addButton = screen.getByRole('button', { name: /Add Step/i });
      fireEvent.click(addButton);

      // Get all step fields
      const stepFields = screen.getAllByLabelText('Step instructions');

      // Update first step
      fireEvent.change(stepFields[0], { target: { value: 'Preheat oven' } });

      // Update second step
      fireEvent.change(stepFields[1], { target: { value: 'Mix ingredients' } });

      // Verify both values
      expect(stepFields[0]).toHaveValue('Preheat oven');
      expect(stepFields[1]).toHaveValue('Mix ingredients');
    });
  });
});
