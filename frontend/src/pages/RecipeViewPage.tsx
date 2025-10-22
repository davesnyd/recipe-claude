import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { recipeApi } from '../services/api';
import { Recipe } from '../types';

const RecipeViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadRecipe(parseInt(id));
    }
  }, [id]);

  const loadRecipe = async (recipeId: number) => {
    try {
      const [recipeResponse, favoritesResponse] = await Promise.all([
        recipeApi.getRecipe(recipeId),
        recipeApi.getFavoriteRecipes(),
      ]);

      setRecipe(recipeResponse.data);
      
      // Check if this recipe is in user's favorites
      const favoriteIds = favoritesResponse.data.map(r => r.recipeId);
      setIsFavorite(favoriteIds.includes(recipeId));
    } catch (error: any) {
      setError('Failed to load recipe. Please try again.');
      console.error('Error loading recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!recipe) return;

    try {
      if (isFavorite) {
        await recipeApi.unmarkAsFavorite(recipe.recipeId);
        setIsFavorite(false);
      } else {
        await recipeApi.markAsFavorite(recipe.recipeId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const canEdit = recipe && recipe.createUsername === user?.username;
  const canFavorite = recipe && recipe.createUsername !== user?.username;

  if (isLoading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !recipe) {
    return (
      <Layout>
        <Alert severity="error" sx={{ m: 3 }}>
          {error || 'Recipe not found'}
        </Alert>
        <Button onClick={() => navigate('/')} sx={{ m: 3 }}>
          Back to Recipes
        </Button>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ width: '90%', mx: 'auto', py: 3 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" component="h1" sx={{ mb: 2 }}>
                {recipe.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                By {recipe.createUsername} • Created {new Date(recipe.creationDate).toLocaleDateString()}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={`Serves ${recipe.servingCount}`} color="primary" variant="outlined" />
                {recipe.isPublic && <Chip label="Public" color="success" variant="outlined" />}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {canFavorite && (
                <IconButton
                  onClick={handleToggleFavorite}
                  color={isFavorite ? 'error' : 'default'}
                >
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              )}
              {canEdit && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/recipe/${recipe.recipeId}/edit`)}
                >
                  Edit
                </Button>
              )}
            </Box>
          </Box>

          {recipe.description && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {recipe.description}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: { xs: 1, md: '0 0 40%' } }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Ingredients
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <List dense>
                    {(recipe as any).recipeIngredients?.map((ingredient: any, index: number) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={`${ingredient.quantity} ${ingredient.measurementName || ingredient.measurement?.measurementName || ''} ${ingredient.ingredientName || ingredient.ingredient?.name || ''}`}
                        />
                      </ListItem>
                    )) || (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText primary="No ingredients listed" />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Instructions
              </Typography>
              {(recipe as any).recipeSteps?.map((step: any, index: number) => (
                <Card key={index} sx={{ mb: 2 }} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'white',
                          borderRadius: '50%',
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {step.stepNumber}
                      </Box>
                      <Typography variant="body1" sx={{ flex: 1 }}>
                        {step.stepText}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )) || (
                <Typography color="text.secondary">No instructions provided</Typography>
              )}
            </Box>
          </Box>

          {recipe.note && (
            <>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Notes
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <Typography variant="body2">
                  {recipe.note}
                </Typography>
              </Paper>
            </>
          )}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Back to Recipes
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton>
                <ShareIcon />
              </IconButton>
              <IconButton>
                <PrintIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default RecipeViewPage;
