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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  FormGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { recipeApi } from '../services/api';
import { Recipe, RecipeIngredient, RecipeStep, CreateRecipeIngredient } from '../types';

// Sortable wrapper component for ingredients
interface SortableIngredientProps {
  id: string;
  children: React.ReactNode;
}

const SortableIngredient: React.FC<SortableIngredientProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton
            {...attributes}
            {...listeners}
            sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
            size="small"
          >
            <DragHandleIcon />
          </IconButton>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
};

// Sortable wrapper component for steps
interface SortableStepProps {
  id: string;
  children: React.ReactNode;
}

const SortableStep: React.FC<SortableStepProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <IconButton
            {...attributes}
            {...listeners}
            sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' }, mt: 1 }}
            size="small"
          >
            <DragHandleIcon />
          </IconButton>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
};

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
    category: '',
    cuisine: '',
    holiday: '',
    course: '',
    type: '',
  });
  
  const [ingredients, setIngredients] = useState<CreateRecipeIngredient[]>([
    { quantity: undefined, ingredientName: '', measurementName: '', preparation: '' }
  ]);
  
  const [steps, setSteps] = useState<Partial<RecipeStep>[]>([
    { stepNumber: 1, stepText: '' }
  ]);

  const [servingCountInput, setServingCountInput] = useState<string>('1');
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for ingredient input fields
  const ingredientRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Refs for step input fields
  const stepRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Generate unique IDs for sortable items
  const ingredientIds = ingredients.map((_, index) => `ingredient-${index}`);
  const stepIds = steps.map((_, index) => `step-${index}`);

  // Handle ingredient drag end
  const handleIngredientDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setIngredients((items) => {
        const oldIndex = ingredientIds.indexOf(active.id as string);
        const newIndex = ingredientIds.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Handle step drag end
  const handleStepDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = stepIds.indexOf(active.id as string);
        const newIndex = stepIds.indexOf(over.id as string);
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Renumber steps after reorder
        newItems.forEach((step, i) => {
          step.stepNumber = i + 1;
        });
        return newItems;
      });
    }
  };

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
      setServingCountInput(String(recipeData.servingCount || 1));
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
                value={servingCountInput}
                onChange={(e) => {
                  setServingCountInput(e.target.value);
                  const parsed = parseInt(e.target.value);
                  if (!isNaN(parsed) && parsed >= 1) {
                    handleRecipeChange('servingCount', parsed);
                  }
                }}
                onBlur={() => {
                  const parsed = parseInt(servingCountInput);
                  if (isNaN(parsed) || parsed < 1) {
                    setServingCountInput('1');
                    handleRecipeChange('servingCount', 1);
                  }
                }}
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

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Category"
              value={recipe.category || ''}
              onChange={(e) => handleRecipeChange('category', e.target.value)}
              sx={{ minWidth: 180 }}
            />
            <TextField
              label="Cuisine"
              value={recipe.cuisine || ''}
              onChange={(e) => handleRecipeChange('cuisine', e.target.value)}
              sx={{ minWidth: 180 }}
            />
            <TextField
              label="Holiday"
              value={recipe.holiday || ''}
              onChange={(e) => handleRecipeChange('holiday', e.target.value)}
              sx={{ minWidth: 180 }}
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel id="course-label">Course</InputLabel>
              <Select
                labelId="course-label"
                label="Course"
                value={recipe.course || ''}
                onChange={(e) => handleRecipeChange('course', e.target.value)}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {['breakfast', 'soup', 'salad', 'appetizer', 'dessert', 'side dish', 'vegetable', 'main'].map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Type</Typography>
            <FormGroup row>
              {['vegetarian', 'vegan', 'low carb', 'gluten free', 'dairy free', 'nut free'].map(t => {
                const types = (recipe.type || '').split(',').map(s => s.trim()).filter(Boolean);
                return (
                  <FormControlLabel
                    key={t}
                    control={
                      <Checkbox
                        checked={types.includes(t)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...types, t]
                            : types.filter(x => x !== t);
                          handleRecipeChange('type', updated.join(','));
                        }}
                      />
                    }
                    label={t}
                  />
                );
              })}
            </FormGroup>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Ingredients
          </Typography>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleIngredientDragEnd}
          >
            <SortableContext items={ingredientIds} strategy={verticalListSortingStrategy}>
              {ingredients.map((ingredient, index) => (
                <SortableIngredient key={ingredientIds[index]} id={ingredientIds[index]}>
                  <TextField
                    label="Quantity"
                    value={ingredient.quantity ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleIngredientChange(index, 'quantity', value === '' ? undefined : value);
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
                </SortableIngredient>
              ))}
            </SortableContext>
          </DndContext>

          <Button
            startIcon={<AddIcon />}
            onClick={() => addIngredient(true)}
            sx={{ mb: 3 }}
          >
            Add Ingredient
          </Button>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Instructions
          </Typography>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleStepDragEnd}
          >
            <SortableContext items={stepIds} strategy={verticalListSortingStrategy}>
              {steps.map((step, index) => (
                <SortableStep key={stepIds[index]} id={stepIds[index]}>
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
                </SortableStep>
              ))}
            </SortableContext>
          </DndContext>

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
