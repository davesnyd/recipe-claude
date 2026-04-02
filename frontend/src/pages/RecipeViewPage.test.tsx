import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RecipeViewPage from './RecipeViewPage';
import { recipeApi } from '../services/api';

jest.mock('../services/api', () => ({
  recipeApi: {
    getRecipe: jest.fn(),
    getFavoriteRecipes: jest.fn(),
    markAsFavorite: jest.fn(),
    unmarkAsFavorite: jest.fn(),
  },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { userId: 1, username: 'chef@example.com', measurementPreference: 'Imperial' },
    isAuthenticated: true,
  }),
}));

// Minimal mock for jsPDF to avoid canvas issues in tests
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    splitTextToSize: jest.fn(() => []),
    save: jest.fn(),
    addPage: jest.fn(),
    internal: { pageSize: { getHeight: () => 297, getWidth: () => 210 } },
  }));
});
jest.mock('jspdf-autotable', () => jest.fn());

const mockRecipe = {
  recipeId: 1,
  title: 'Test Recipe',
  description: 'A test recipe',
  servingCount: 4,
  isPublic: true,
  creationDate: '2024-01-15T10:30:00Z',
  createUsername: 'chef@example.com',
  recipeIngredients: [],
  recipeSteps: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  (recipeApi.getRecipe as jest.Mock).mockResolvedValue({ data: mockRecipe });
  (recipeApi.getFavoriteRecipes as jest.Mock).mockResolvedValue({ data: [] });
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/recipe/1']}>
      <Routes>
        <Route path="/recipe/:id" element={<RecipeViewPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('RecipeViewPage', () => {
  describe('Creation date display', () => {
    it('shows a formatted date when creationDate is valid', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Test Recipe')).toBeInTheDocument());
      expect(screen.queryByText(/invalid date/i)).not.toBeInTheDocument();
    });

    it('does not show "Invalid Date" when creationDate is null', async () => {
      (recipeApi.getRecipe as jest.Mock).mockResolvedValue({
        data: { ...mockRecipe, creationDate: null },
      });
      renderPage();
      await waitFor(() => expect(screen.getByText('Test Recipe')).toBeInTheDocument());
      expect(screen.queryByText(/invalid date/i)).not.toBeInTheDocument();
    });

    it('does not show "Invalid Date" when creationDate is undefined', async () => {
      (recipeApi.getRecipe as jest.Mock).mockResolvedValue({
        data: { ...mockRecipe, creationDate: undefined },
      });
      renderPage();
      await waitFor(() => expect(screen.getByText('Test Recipe')).toBeInTheDocument());
      expect(screen.queryByText(/invalid date/i)).not.toBeInTheDocument();
    });
  });

  describe('Export filename', () => {
    it('shows a filename field in the export dialog', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Test Recipe')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: /export/i }));

      await waitFor(() => expect(screen.getByLabelText(/filename/i)).toBeInTheDocument());
    });

    it('defaults filename to recipe.pdf (PDF is default format)', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Test Recipe')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: /export/i }));

      await waitFor(() => {
        const filenameField = screen.getByLabelText(/filename/i);
        expect(filenameField).toHaveValue('recipe.pdf');
      });
    });

    it('defaults filename to recipe.xml when RecipeML is selected', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Test Recipe')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: /export/i }));

      await waitFor(() => screen.getByLabelText(/filename/i));

      fireEvent.click(screen.getByLabelText(/recipeml/i));

      await waitFor(() => {
        const filenameField = screen.getByLabelText(/filename/i);
        expect(filenameField).toHaveValue('recipe.xml');
      });
    });

    it('defaults filename to recipe.json when JSON-LD is selected', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Test Recipe')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: /export/i }));

      await waitFor(() => screen.getByLabelText(/filename/i));

      fireEvent.click(screen.getByLabelText(/json-ld/i));

      await waitFor(() => {
        const filenameField = screen.getByLabelText(/filename/i);
        expect(filenameField).toHaveValue('recipe.json');
      });
    });

    it('allows the user to change the filename', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Test Recipe')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: /export/i }));
      await waitFor(() => screen.getByLabelText(/filename/i));

      const filenameField = screen.getByLabelText(/filename/i);
      fireEvent.change(filenameField, { target: { value: 'my_recipe.xml' } });
      expect(filenameField).toHaveValue('my_recipe.xml');
    });
  });
});
