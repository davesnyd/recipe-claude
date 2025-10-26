import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { recipeApi } from '../services/api';
import { Recipe, RecipeIngredient, RecipeStep, CreateRecipeIngredient } from '../types';

const RecipeEditPage: React.FC = () => {
  console.log('RecipeEditPage: Component started rendering');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if we're on the /recipe/new route (no params) or /recipe/:id route with id="new"
  const isNew = id === 'new' || window.location.pathname === '/recipe/new';
  
  console.log('RecipeEditPage: id from params:', id);
  console.log('RecipeEditPage: current pathname:', window.location.pathname);
  console.log('RecipeEditPage: isNew:', isNew);

  const [recipe, setRecipe] = useState<Partial<Recipe>>({
    title: '',
    description: '',
    servingCount: 1,
    isPublic: false,
    note: '',
  });
  
  const [ingredients, setIngredients] = useState<CreateRecipeIngredient[]>([
    { quantity: undefined, ingredientName: '', measurementName: '', preparation: '' }
  ]);
  
  const [steps, setSteps] = useState<Partial<RecipeStep>[]>([
    { stepNumber: 1, stepText: '' }
  ]);

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for ingredient input fields
  const ingredientRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Refs for step input fields
  const stepRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  console.log('RecipeEditPage: State initialized, isLoading:', !isNew);

  useEffect(() => {
    console.log('RecipeEditPage: useEffect called, isNew:', isNew, 'id:', id);
    if (!isNew && id) {
      console.log('RecipeEditPage: About to load recipe for id:', id);
      loadRecipe(parseInt(id));
    } else {
      console.log('RecipeEditPage: New recipe, not loading existing recipe');
    }
  }, [id, isNew]);

  const loadRecipe = async (recipeId: number) => {
    try {
      const response = await recipeApi.getRecipe(recipeId);
      const recipeData = response.data;
      
      setRecipe(recipeData);
      const formattedIngredients = (recipeData as any).recipeIngredients?.map((ing: any) => ({
        ingredientName: ing.ingredientName || ing.ingredient?.name || '',
        quantity: ing.quantity,
        measurementName: ing.measurementName || ing.measurement?.measurementName || '',
        preparation: ing.preparation || ''
      })) || [{ quantity: undefined, ingredientName: '', measurementName: '', preparation: '' }];
      setIngredients(formattedIngredients);
      setSteps((recipeData as any).recipeSteps || [{ stepNumber: 1, stepText: '' }]);
    } catch (error: any) {
      setError('Failed to load recipe. Please try again.');
      console.error('Error loading recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipeChange = (field: string, value: any) => {
    setRecipe(prev => ({ ...prev, [field]: value }));
  };

  const handleIngredientChange = (index: number, field: string, value: any) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], stepText: value };
    setSteps(newSteps);
  };

  const addIngredient = (focusQuantity = false) => {
    const newIndex = ingredients.length;
    setIngredients([...ingredients, { quantity: undefined, ingredientName: '', measurementName: '', preparation: '' }]);

    if (focusQuantity) {
      // Focus the quantity field of the new ingredient after state update
      setTimeout(() => {
        const quantityRef = ingredientRefs.current[`quantity-${newIndex}`];
        if (quantityRef) {
          quantityRef.focus();
        }
      }, 0);
    }
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const addStep = (focusNewStep = false) => {
    const newIndex = steps.length;
    setSteps([...steps, { stepNumber: steps.length + 1, stepText: '' }]);

    if (focusNewStep) {
      // Focus the new step field after state update
      setTimeout(() => {
        const stepRef = stepRefs.current[`step-${newIndex}`];
        if (stepRef) {
          stepRef.focus();
        }
      }, 0);
    }
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_, i) => i !== index);
      // Renumber steps
      newSteps.forEach((step, i) => {
        step.stepNumber = i + 1;
      });
      setSteps(newSteps);
    }
  };

  const handleSave = async () => {
    console.log('RecipeEditPage: handleSave called');
    console.log('RecipeEditPage: current recipe data:', recipe);
    console.log('RecipeEditPage: current ingredients:', ingredients);
    console.log('RecipeEditPage: current steps:', steps);
    
    setIsSaving(true);
    setError(null);

    try {
      const filteredIngredients = ingredients.filter(ing => ing.ingredientName?.trim());
      const filteredSteps = steps.filter(step => step.stepText?.trim()).map((step, index) => ({
        stepNumber: index + 1,
        stepText: step.stepText || '',
        photoUrl: step.photoUrl,
      }));

      console.log('RecipeEditPage: filtered ingredients:', filteredIngredients);
      console.log('RecipeEditPage: filtered steps:', filteredSteps);
      
      // Log individual ingredients
      filteredIngredients.forEach((ingredient, index) => {
        console.log(`RecipeEditPage: ingredient ${index}:`, {
          ingredientName: ingredient.ingredientName,
          quantity: ingredient.quantity,
          measurementName: ingredient.measurementName
        });
      });
      
      // Log individual steps
      filteredSteps.forEach((step, index) => {
        console.log(`RecipeEditPage: step ${index}:`, {
          stepNumber: step.stepNumber,
          stepText: step.stepText,
          photoUrl: step.photoUrl
        });
      });

      const recipeData = {
        ...recipe,
        ingredients: filteredIngredients as any,
        steps: filteredSteps as any,
      };

      console.log('RecipeEditPage: prepared recipeData for API call:', recipeData);
      console.log('RecipeEditPage: JSON stringified recipeData:', JSON.stringify(recipeData, null, 2));
      console.log('RecipeEditPage: isNew:', isNew);

      if (isNew) {
        console.log('RecipeEditPage: calling createRecipe API');
        const response = await recipeApi.createRecipe(recipeData);
        console.log('RecipeEditPage: createRecipe response:', response);
      } else {
        console.log('RecipeEditPage: calling updateRecipe API');
        const response = await recipeApi.updateRecipe(parseInt(id!), recipeData);
        console.log('RecipeEditPage: updateRecipe response:', response);
      }

      console.log('RecipeEditPage: save successful, navigating to home');
      navigate('/');
    } catch (error: any) {
      console.error('RecipeEditPage: Error saving recipe:', error);
      console.error('RecipeEditPage: Error details:', error.response?.data, error.response?.status);
      setError('Failed to save recipe. Please try again.');
    } finally {
      console.log('RecipeEditPage: setting isSaving to false');
      setIsSaving(false);
    }
  };

  console.log('RecipeEditPage: About to render, isLoading:', isLoading);
  
  if (isLoading) {
    console.log('RecipeEditPage: Rendering loading spinner');
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  console.log('RecipeEditPage: Rendering main form');

  return (
    <Layout>
      <Box sx={{ width: '90%', mx: 'auto', py: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          {isNew ? 'Create New Recipe' : 'Edit Recipe'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Recipe Title"
              value={recipe.title || ''}
              onChange={(e) => handleRecipeChange('title', e.target.value)}
              required
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={recipe.description || ''}
              onChange={(e) => handleRecipeChange('description', e.target.value)}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="number"
                label="Servings"
                value={recipe.servingCount || 1}
                onChange={(e) => handleRecipeChange('servingCount', parseInt(e.target.value) || 1)}
                InputProps={{ inputProps: { min: 1 } }}
                sx={{ minWidth: 120 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={recipe.isPublic || false}
                    onChange={(e) => handleRecipeChange('isPublic', e.target.checked)}
                  />
                }
                label="Make recipe public"
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Ingredients
          </Typography>

          {ingredients.map((ingredient, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    type="number"
                    label="Quantity"
                    value={ingredient.quantity ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleIngredientChange(index, 'quantity', value === '' ? undefined : parseFloat(value));
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const unitRef = ingredientRefs.current[`unit-${index}`];
                        if (unitRef) unitRef.focus();
                      }
                    }}
                    inputRef={(el) => ingredientRefs.current[`quantity-${index}`] = el}
                    sx={{ width: 150 }}
                  />
                  <TextField
                    label="Unit"
                    value={ingredient.measurementName || ''}
                    onChange={(e) => handleIngredientChange(index, 'measurementName', e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const ingredientRef = ingredientRefs.current[`ingredient-${index}`];
                        if (ingredientRef) ingredientRef.focus();
                      }
                    }}
                    inputRef={(el) => ingredientRefs.current[`unit-${index}`] = el}
                    sx={{ width: 200 }}
                  />
                  <TextField
                    label="Ingredient"
                    value={ingredient.ingredientName || ''}
                    onChange={(e) => handleIngredientChange(index, 'ingredientName', e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const preparationRef = ingredientRefs.current[`preparation-${index}`];
                        if (preparationRef) preparationRef.focus();
                      }
                    }}
                    inputRef={(el) => ingredientRefs.current[`ingredient-${index}`] = el}
                    sx={{ width: 250 }}
                  />
                  <TextField
                    label="Preparation"
                    value={ingredient.preparation || ''}
                    onChange={(e) => handleIngredientChange(index, 'preparation', e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addIngredient(true);
                      }
                    }}
                    inputRef={(el) => ingredientRefs.current[`preparation-${index}`] = el}
                    sx={{ width: 200 }}
                  />
                  <IconButton
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={() => addIngredient(false)}
            sx={{ mb: 3 }}
          >
            Add Ingredient
          </Button>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Instructions
          </Typography>

          {steps.map((step, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Typography variant="h6" sx={{ mt: 1, minWidth: 30 }}>
                    {index + 1}.
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Step instructions"
                    value={step.stepText || ''}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        addStep(true);
                      }
                    }}
                    inputRef={(el) => stepRefs.current[`step-${index}`] = el}
                  />
                  <IconButton
                    onClick={() => removeStep(index)}
                    disabled={steps.length === 1}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={() => addStep(false)}
            sx={{ mb: 3 }}
          >
            Add Step
          </Button>

          <Divider sx={{ my: 3 }} />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (optional)"
            value={recipe.note || ''}
            onChange={(e) => handleRecipeChange('note', e.target.value)}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isSaving || !recipe.title?.trim()}
            >
              {isSaving ? <CircularProgress size={24} /> : isNew ? 'Create Recipe' : 'Save Changes'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default RecipeEditPage;
