import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import { recipeApi } from '../services/api';

jest.mock('../services/api', () => ({
  recipeApi: {
    getMyRecipes: jest.fn(),
    getFavoriteRecipes: jest.fn(),
    getPublicRecipes: jest.fn(),
    deleteRecipe: jest.fn(),
    markAsFavorite: jest.fn(),
    unmarkAsFavorite: jest.fn(),
  },
  importApi: {
    importRecipes: jest.fn(),
    importBigOven: jest.fn(),
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

jest.mock('jspdf', () => jest.fn().mockImplementation(() => ({
  setFontSize: jest.fn(),
  setFont: jest.fn(),
  text: jest.fn(),
  splitTextToSize: jest.fn(() => []),
  save: jest.fn(),
  addPage: jest.fn(),
  internal: { pageSize: { getHeight: () => 297, getWidth: () => 210 } },
})));
jest.mock('jspdf-autotable', () => jest.fn());

const mockRecipes = [
  {
    recipeId: 1,
    title: 'Apple Pie',
    description: 'A classic pie',
    servingCount: 8,
    isPublic: true,
    creationDate: '2024-01-15T10:30:00Z',
    createUsername: 'chef@example.com',
    recipeIngredients: [],
    recipeSteps: [],
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  (recipeApi.getMyRecipes as jest.Mock).mockResolvedValue({ data: mockRecipes });
  (recipeApi.getFavoriteRecipes as jest.Mock).mockResolvedValue({ data: [] });
  (recipeApi.getPublicRecipes as jest.Mock).mockResolvedValue({ data: mockRecipes });
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );

describe('HomePage page size', () => {
  it('renders a page size selector', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Apple Pie')).toBeInTheDocument());
    expect(screen.getByLabelText(/rows per page/i)).toBeInTheDocument();
  });

  it('page size selector includes options 10, 20, 50, 100', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Apple Pie')).toBeInTheDocument());
    const selector = screen.getByLabelText(/rows per page/i);
    fireEvent.mouseDown(selector);
    await waitFor(() => {
      expect(screen.getByRole('option', { name: '10' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '20' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '50' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '100' })).toBeInTheDocument();
    });
  });
});

describe('HomePage sort persistence', () => {
  it('saves sort key to sessionStorage when sorting', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Apple Pie')).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('button', { name: /sort by title/i })[0]);

    expect(sessionStorage.getItem('recipe_sortKeys')).toBe(JSON.stringify(['title']));
  });

  it('restores sort state from sessionStorage on mount', async () => {
    sessionStorage.setItem('recipe_sortKeys', JSON.stringify(['title']));
    sessionStorage.setItem('recipe_sortDirs', JSON.stringify({ title: 'desc' }));

    renderPage();
    await waitFor(() => expect(screen.getByText('Apple Pie')).toBeInTheDocument());

    const titleSortBtn = screen.getAllByRole('button', { name: /sort by title/i })[0];
    expect(titleSortBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
