import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import RecipeTable from '../components/RecipeTable';
import { useAuth } from '../contexts/AuthContext';
import { recipeApi } from '../services/api';
import { Recipe } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`recipe-tabpanel-${index}`}
      aria-labelledby={`recipe-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [publicRecipes, setPublicRecipes] = useState<Recipe[]>([]);
  const [userFavorites, setUserFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('HomePage: Starting to load recipes');
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [myResponse, favoriteResponse, publicResponse] = await Promise.all([
        recipeApi.getMyRecipes(),
        recipeApi.getFavoriteRecipes(),
        recipeApi.getPublicRecipes(),
      ]);

      setMyRecipes(myResponse.data);
      setFavoriteRecipes(favoriteResponse.data);
      setPublicRecipes(publicResponse.data);

      // Extract favorite recipe IDs
      const favoriteIds = favoriteResponse.data.map(recipe => recipe.recipeId);
      setUserFavorites(favoriteIds);
    } catch (error: any) {
      setError('Failed to load recipes. Please try again.');
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleViewRecipe = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.recipeId}`);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.recipeId}/edit`);
  };

  const handleToggleFavorite = async (recipe: Recipe) => {
    try {
      const isFavorite = userFavorites.includes(recipe.recipeId);
      
      if (isFavorite) {
        await recipeApi.unmarkAsFavorite(recipe.recipeId);
        setUserFavorites(prev => prev.filter(id => id !== recipe.recipeId));
        setFavoriteRecipes(prev => prev.filter(r => r.recipeId !== recipe.recipeId));
      } else {
        await recipeApi.markAsFavorite(recipe.recipeId);
        setUserFavorites(prev => [...prev, recipe.recipeId]);
        // Add to favorites if it's a public recipe
        if (recipe.isPublic && recipe.createUsername !== user?.username) {
          setFavoriteRecipes(prev => [...prev, recipe]);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const canEditRecipe = (recipe: Recipe) => {
    return recipe.createUsername === user?.username;
  };

  const getTabLabel = (label: string, count: number) => {
    return count === 0 ? label : `${label} (${count})`;
  };

  const isTabDisabled = (count: number) => count === 0;

  if (isLoading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Recipe Collection
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            console.log('HomePage: Add Recipe button clicked, navigating to /recipe/new');
            navigate('/recipe/new');
          }}
          sx={{ px: 3, py: 1.5 }}
        >
          Add Recipe
        </Button>
      </Box>

      <Paper elevation={1}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="recipe tabs"
            variant="fullWidth"
          >
            <Tab
              label={getTabLabel('My Recipes', myRecipes.length)}
              disabled={isTabDisabled(myRecipes.length)}
              sx={{ opacity: isTabDisabled(myRecipes.length) ? 0.5 : 1 }}
            />
            <Tab
              label={getTabLabel('Favorites', favoriteRecipes.length)}
              disabled={isTabDisabled(favoriteRecipes.length)}
              sx={{ opacity: isTabDisabled(favoriteRecipes.length) ? 0.5 : 1 }}
            />
            <Tab
              label={getTabLabel('All Recipes', publicRecipes.length)}
              disabled={isTabDisabled(publicRecipes.length)}
              sx={{ opacity: isTabDisabled(publicRecipes.length) ? 0.5 : 1 }}
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <RecipeTable
            recipes={myRecipes}
            onView={handleViewRecipe}
            onEdit={handleEditRecipe}
            onToggleFavorite={handleToggleFavorite}
            userFavorites={userFavorites}
            canEdit={canEditRecipe}
            showFavoriteButton={false}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <RecipeTable
            recipes={favoriteRecipes}
            onView={handleViewRecipe}
            onEdit={handleEditRecipe}
            onToggleFavorite={handleToggleFavorite}
            userFavorites={userFavorites}
            canEdit={canEditRecipe}
            showFavoriteButton={true}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <RecipeTable
            recipes={publicRecipes}
            onView={handleViewRecipe}
            onEdit={handleEditRecipe}
            onToggleFavorite={handleToggleFavorite}
            userFavorites={userFavorites}
            canEdit={canEditRecipe}
            showFavoriteButton={true}
          />
        </TabPanel>
      </Paper>
    </Layout>
  );
};

export default HomePage;