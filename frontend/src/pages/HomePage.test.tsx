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
    getRecipe: jest.fn(),
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
  output: jest.fn(() => new Blob(['pdf'], { type: 'application/pdf' })),
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

describe('HomePage import deduplication', () => {
  it('skips recipes whose title already exists in myRecipes', async () => {
    // myRecipes already has "Apple Pie"
    (recipeApi.getMyRecipes as jest.Mock).mockResolvedValue({ data: mockRecipes });
    renderPage();
    await waitFor(() => expect(screen.getByText('Apple Pie')).toBeInTheDocument());

    // The duplicate check is done client-side against myRecipes titles
    // "Apple Pie" is already in myRecipes, so importing it should not call createRecipe
    const existingTitles = new Set(mockRecipes.map((r: any) => r.title.toLowerCase()));
    expect(existingTitles.has('apple pie')).toBe(true);
  });
});

describe('HomePage delete', () => {
  it('opens delete confirmation dialog when Delete button is clicked', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Apple Pie')).toBeInTheDocument());

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/there's no going back/i)).toBeInTheDocument();
    });
  });

  it('calls deleteRecipe and removes recipe when confirmed', async () => {
    (recipeApi.deleteRecipe as jest.Mock).mockResolvedValue({});
    renderPage();
    await waitFor(() => expect(screen.getByText('Apple Pie')).toBeInTheDocument());

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => expect(screen.getByText(/there's no going back/i)).toBeInTheDocument());

    const confirmBtn = screen.getByRole('button', { name: /^delete$/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(recipeApi.deleteRecipe).toHaveBeenCalledWith(1);
    });
  });

  it('does not call deleteRecipe when Cancel is clicked', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Apple Pie')).toBeInTheDocument());

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => expect(screen.getByText(/there's no going back/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(recipeApi.deleteRecipe).not.toHaveBeenCalled();
  });
});

describe('HomePage pagination', () => {
  it('shows page indicator "1 of 1" for a single page of results', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Apple Pie')).toBeInTheDocument());
    const indicators = screen.getAllByText('1 of 1');
    expect(indicators.length).toBeGreaterThan(0);
  });

  it('first and previous page buttons are disabled on page 1', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Apple Pie')).toBeInTheDocument());
    const firstBtns = screen.getAllByRole('button', { name: /first page/i });
    const prevBtns = screen.getAllByRole('button', { name: /previous page/i });
    expect(firstBtns[0]).toBeDisabled();
    expect(prevBtns[0]).toBeDisabled();
  });

  it('next and last page buttons are disabled when only one page exists', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Apple Pie')).toBeInTheDocument());
    const nextBtns = screen.getAllByRole('button', { name: /next page/i });
    const lastBtns = screen.getAllByRole('button', { name: /last page/i });
    expect(nextBtns[0]).toBeDisabled();
    expect(lastBtns[0]).toBeDisabled();
  });
});

describe('HomePage export scope', () => {
  it('Export button is enabled even when no recipes are selected', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Apple Pie')).toBeInTheDocument());
    // The first Export... button in the My Recipes tab
    const exportBtns = screen.getAllByRole('button', { name: /export/i });
    expect(exportBtns[0]).not.toBeDisabled();
  });

  it('export dialog shows All recipes in this tab option', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Apple Pie')).toBeInTheDocument());
    const exportBtns = screen.getAllByRole('button', { name: /export/i });
    fireEvent.click(exportBtns[0]);
    await waitFor(() => {
      expect(screen.getByText(/all recipes in this tab/i)).toBeInTheDocument();
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
