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
  Edit,
  Favorite,
  FavoriteBorder,
  Delete,
  ArrowUpward,
  ArrowDownward,
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
  sortDirs?: Record<string, 'asc' | 'desc'>;
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
  sortDirs = {},
  onSort,
}) => {
  const isFavorite = (recipeId: number) => userFavorites.includes(recipeId);
  const isSelected = (recipeId: number) => selectedRecipes.includes(recipeId);

  const SortButton: React.FC<{ sortKey: string; label: string }> = ({ sortKey, label }) => {
    if (!onSort) return <span>{label}</span>;
    const isActive = sortKeys[0] === sortKey;
    const isDesc = isActive && sortDirs[sortKey] === 'desc';
    const SortIcon = isDesc ? ArrowDownward : ArrowUpward;
    return (
      <Button
        size="small"
        aria-label={`Sort by ${label}`}
        aria-pressed={isActive}
        onClick={() => onSort(sortKey)}
        endIcon={isActive ? <SortIcon fontSize="small" /> : undefined}
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

  const resizableTh = { color: 'primary.contrastText', fontWeight: 'bold', resize: 'horizontal', overflow: 'hidden' };

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
            <TableCell sx={resizableTh}>
              <SortButton sortKey="title" label="Title" />
            </TableCell>
            <TableCell sx={resizableTh}>
              Description
            </TableCell>
            <TableCell sx={resizableTh}>
              <SortButton sortKey="creationDate" label="Date" />
            </TableCell>
            <TableCell sx={resizableTh}>
              <SortButton sortKey="createUsername" label="User" />
            </TableCell>
            <TableCell sx={resizableTh}>
              Visibility
            </TableCell>
            <TableCell sx={resizableTh}>
              <SortButton sortKey="category" label="Category" />
            </TableCell>
            <TableCell sx={resizableTh}>
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
              onClick={() => onView(recipe)}
              sx={{ cursor: 'pointer', '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
            >
              {onSelectRecipe && (
                <TableCell>
                  <Checkbox
                    checked={isSelected(recipe.recipeId)}
                    onClick={(e) => e.stopPropagation()}
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
                  {canEdit(recipe) && (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Edit />}
                        onClick={(e) => { e.stopPropagation(); onEdit(recipe); }}
                        sx={{ minWidth: 'auto' }}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={(e) => { e.stopPropagation(); onDelete(recipe); }}
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
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite(recipe); }}
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