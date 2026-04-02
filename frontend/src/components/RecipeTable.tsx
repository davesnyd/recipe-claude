import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  Chip,
  Checkbox,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Favorite,
  FavoriteBorder,
  Delete,
  ArrowUpward,
} from '@mui/icons-material';
import { Recipe } from '../types';

interface RecipeTableProps {
  recipes: Recipe[];
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onToggleFavorite: (recipe: Recipe) => void;
  userFavorites: number[];
  canEdit?: (recipe: Recipe) => boolean;
  showFavoriteButton?: boolean;
  selectedRecipes?: number[];
  onSelectRecipe?: (recipeId: number) => void;
  sortKeys?: string[];
  onSort?: (key: string) => void;
}

const RecipeTable: React.FC<RecipeTableProps> = ({
  recipes,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
  userFavorites,
  canEdit = () => true,
  showFavoriteButton = true,
  selectedRecipes = [],
  onSelectRecipe,
  sortKeys = [],
  onSort,
}) => {
  const isFavorite = (recipeId: number) => userFavorites.includes(recipeId);
  const isSelected = (recipeId: number) => selectedRecipes.includes(recipeId);

  const SortButton: React.FC<{ sortKey: string; label: string }> = ({ sortKey, label }) => {
    if (!onSort) return <span>{label}</span>;
    const isActive = sortKeys[0] === sortKey;
    return (
      <Button
        size="small"
        aria-label={`Sort by ${label}`}
        aria-pressed={isActive}
        onClick={() => onSort(sortKey)}
        endIcon={isActive ? <ArrowUpward fontSize="small" /> : undefined}
        sx={{ color: 'primary.contrastText', textTransform: 'none', fontWeight: 'bold', p: 0, minWidth: 0 }}
      >
        {label}
      </Button>
    );
  };

  if (recipes.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No recipes found
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead sx={{ backgroundColor: 'primary.main' }}>
          <TableRow>
            {onSelectRecipe && (
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold', width: 50 }}>
                Select
              </TableCell>
            )}
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
              <SortButton sortKey="title" label="Title" />
            </TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
              Description
            </TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
              Servings
            </TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
              <SortButton sortKey="creationDate" label="Date" />
            </TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
              <SortButton sortKey="createUsername" label="User" />
            </TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
              Visibility
            </TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
              <SortButton sortKey="category" label="Category" />
            </TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
              <SortButton sortKey="course" label="Course" />
            </TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {recipes.map((recipe) => (
            <TableRow
              key={recipe.recipeId}
              hover
              sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
            >
              {onSelectRecipe && (
                <TableCell>
                  <Checkbox
                    checked={isSelected(recipe.recipeId)}
                    onChange={() => onSelectRecipe(recipe.recipeId)}
                  />
                </TableCell>
              )}
              <TableCell>
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {recipe.title}
                  </Typography>
                  {isFavorite(recipe.recipeId) && showFavoriteButton && (
                    <Chip
                      icon={<Favorite />}
                      label="Favorite"
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </TableCell>
              
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    maxWidth: 300,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {recipe.description || 'No description'}
                </Typography>
              </TableCell>
              
              <TableCell>
                <Typography variant="body2">
                  {recipe.servingCount}
                </Typography>
              </TableCell>
              
              <TableCell>
                <Typography variant="body2">
                  {recipe.creationDate ? new Date(recipe.creationDate).toLocaleDateString() : ''}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2">{recipe.createUsername}</Typography>
              </TableCell>

              <TableCell>
                <Chip
                  label={recipe.isPublic ? 'Public' : 'Private'}
                  color={recipe.isPublic ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>

              <TableCell>
                <Typography variant="body2">{recipe.category || ''}</Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2">{recipe.course || ''}</Typography>
              </TableCell>

              <TableCell>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => onView(recipe)}
                    sx={{ minWidth: 'auto' }}
                  >
                    View
                  </Button>
                  
                  {canEdit(recipe) && (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => onEdit(recipe)}
                        sx={{ minWidth: 'auto' }}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => onDelete(recipe)}
                        sx={{ minWidth: 'auto' }}
                      >
                        Delete
                      </Button>
                    </>
                  )}

                  {showFavoriteButton && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={isFavorite(recipe.recipeId) ? <Favorite /> : <FavoriteBorder />}
                      onClick={() => onToggleFavorite(recipe)}
                      color={isFavorite(recipe.recipeId) ? 'primary' : 'inherit'}
                      sx={{ minWidth: 'auto' }}
                    >
                      {isFavorite(recipe.recipeId) ? 'Unfavorite' : 'Favorite'}
                    </Button>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RecipeTable;