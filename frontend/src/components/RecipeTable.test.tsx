import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecipeTable from './RecipeTable';
import { Recipe } from '../types';

// Mock recipe data
const mockRecipes: Recipe[] = [
  {
    recipeId: 1,
    title: 'Chocolate Cake',
    description: 'A delicious chocolate cake recipe',
    servingCount: 8,
    isPublic: true,
    creationDate: '2024-01-15T10:30:00Z',
    createUsername: 'chef@example.com',
    ingredients: [],
    steps: [],
  },
  {
    recipeId: 2,
    title: 'Banana Bread',
    description: 'Classic homemade banana bread',
    servingCount: 6,
    isPublic: false,
    creationDate: '2024-01-20T14:00:00Z',
    createUsername: 'baker@example.com',
    ingredients: [],
    steps: [],
  },
];

const mockHandlers = {
  onView: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onToggleFavorite: jest.fn(),
};

describe('RecipeTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders recipe titles', () => {
    render(
      <RecipeTable
        recipes={mockRecipes}
        userFavorites={[]}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    expect(screen.getByText('Banana Bread')).toBeInTheDocument();
  });

  it('renders recipe descriptions', () => {
    render(
      <RecipeTable
        recipes={mockRecipes}
        userFavorites={[]}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('A delicious chocolate cake recipe')).toBeInTheDocument();
    expect(screen.getByText('Classic homemade banana bread')).toBeInTheDocument();
  });

  it('renders serving counts', () => {
    render(
      <RecipeTable
        recipes={mockRecipes}
        userFavorites={[]}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('renders public/private visibility chips', () => {
    render(
      <RecipeTable
        recipes={mockRecipes}
        userFavorites={[]}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('calls onView when View button is clicked', () => {
    render(
      <RecipeTable
        recipes={mockRecipes}
        userFavorites={[]}
        {...mockHandlers}
      />
    );

    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    fireEvent.click(viewButtons[0]);

    expect(mockHandlers.onView).toHaveBeenCalledWith(mockRecipes[0]);
  });

  it('calls onEdit when Edit button is clicked', () => {
    render(
      <RecipeTable
        recipes={mockRecipes}
        userFavorites={[]}
        {...mockHandlers}
      />
    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockRecipes[0]);
  });

  it('calls onDelete when Delete button is clicked', () => {
    render(
      <RecipeTable
        recipes={mockRecipes}
        userFavorites={[]}
        {...mockHandlers}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockRecipes[0]);
  });

  it('calls onToggleFavorite when Favorite button is clicked', () => {
    render(
      <RecipeTable
        recipes={mockRecipes}
        userFavorites={[]}
        {...mockHandlers}
      />
    );

    const favoriteButtons = screen.getAllByRole('button', { name: /favorite/i });
    fireEvent.click(favoriteButtons[0]);

    expect(mockHandlers.onToggleFavorite).toHaveBeenCalledWith(mockRecipes[0]);
  });

  it('shows "Unfavorite" for recipes in userFavorites', () => {
    render(
      <RecipeTable
        recipes={mockRecipes}
        userFavorites={[1]}
        {...mockHandlers}
      />
    );

    expect(screen.getByRole('button', { name: /unfavorite/i })).toBeInTheDocument();
  });

  it('shows empty state when no recipes', () => {
    render(
      <RecipeTable
        recipes={[]}
        userFavorites={[]}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('No recipes found')).toBeInTheDocument();
  });

  it('hides Edit and Delete buttons when canEdit returns false', () => {
    render(
      <RecipeTable
        recipes={mockRecipes}
        userFavorites={[]}
        canEdit={() => false}
        {...mockHandlers}
      />
    );

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('hides favorite button when showFavoriteButton is false', () => {
    render(
      <RecipeTable
        recipes={mockRecipes}
        userFavorites={[]}
        showFavoriteButton={false}
        {...mockHandlers}
      />
    );

    expect(screen.queryByRole('button', { name: /favorite/i })).not.toBeInTheDocument();
  });

  it('renders table headers correctly', () => {
    render(
      <RecipeTable
        recipes={mockRecipes}
        userFavorites={[]}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Servings')).toBeInTheDocument();
    expect(screen.getByText('Visibility')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('shows "No description" for recipes without description', () => {
    const recipesWithoutDescription: Recipe[] = [
      {
        recipeId: 3,
        title: 'No Description Recipe',
        servingCount: 4,
        isPublic: true,
        creationDate: '2024-01-25T12:00:00Z',
        createUsername: 'test@example.com',
        ingredients: [],
        steps: [],
      },
    ];

    render(
      <RecipeTable
        recipes={recipesWithoutDescription}
        userFavorites={[]}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('shows select checkboxes when onSelectRecipe is provided', () => {
    const onSelectRecipe = jest.fn();

    render(
      <RecipeTable
        recipes={mockRecipes}
        userFavorites={[]}
        selectedRecipes={[]}
        onSelectRecipe={onSelectRecipe}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Select')).toBeInTheDocument();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
  });

  it('calls onSelectRecipe when checkbox is clicked', () => {
    const onSelectRecipe = jest.fn();

    render(
      <RecipeTable
        recipes={mockRecipes}
        userFavorites={[]}
        selectedRecipes={[]}
        onSelectRecipe={onSelectRecipe}
        {...mockHandlers}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(onSelectRecipe).toHaveBeenCalledWith(1);
  });

  describe('Sorting', () => {
    it('renders a sort button for Title column', () => {
      const onSort = jest.fn();
      render(
        <RecipeTable recipes={mockRecipes} userFavorites={[]} sortKeys={[]} onSort={onSort} {...mockHandlers} />
      );
      expect(screen.getByRole('button', { name: /sort by title/i })).toBeInTheDocument();
    });

    it('calls onSort with "title" when Title sort button is clicked', () => {
      const onSort = jest.fn();
      render(
        <RecipeTable recipes={mockRecipes} userFavorites={[]} sortKeys={[]} onSort={onSort} {...mockHandlers} />
      );
      fireEvent.click(screen.getByRole('button', { name: /sort by title/i }));
      expect(onSort).toHaveBeenCalledWith('title');
    });

    it('calls onSort with "creationDate" when Date sort button is clicked', () => {
      const onSort = jest.fn();
      render(
        <RecipeTable recipes={mockRecipes} userFavorites={[]} sortKeys={[]} onSort={onSort} {...mockHandlers} />
      );
      fireEvent.click(screen.getByRole('button', { name: /sort by date/i }));
      expect(onSort).toHaveBeenCalledWith('creationDate');
    });

    it('calls onSort with "createUsername" when User sort button is clicked', () => {
      const onSort = jest.fn();
      render(
        <RecipeTable recipes={mockRecipes} userFavorites={[]} sortKeys={[]} onSort={onSort} {...mockHandlers} />
      );
      fireEvent.click(screen.getByRole('button', { name: /sort by user/i }));
      expect(onSort).toHaveBeenCalledWith('createUsername');
    });

    it('shows active sort indicator on the primary sort column', () => {
      render(
        <RecipeTable recipes={mockRecipes} userFavorites={[]} sortKeys={['title']} onSort={jest.fn()} {...mockHandlers} />
      );
      // The title sort button should indicate it is the active sort
      const titleSortBtn = screen.getByRole('button', { name: /sort by title/i });
      expect(titleSortBtn).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('shows checkbox as checked for selected recipes', () => {
    render(
      <RecipeTable
        recipes={mockRecipes}
        userFavorites={[]}
        selectedRecipes={[1]}
        onSelectRecipe={jest.fn()}
        {...mockHandlers}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });
});
