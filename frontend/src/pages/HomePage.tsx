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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { Add as AddIcon, FileDownload as ExportIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import RecipeTable from '../components/RecipeTable';
import { useAuth } from '../contexts/AuthContext';
import { recipeApi } from '../services/api';
import { Recipe } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [selectedRecipes, setSelectedRecipes] = useState<number[]>([]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'recipeml' | 'jsonld'>('pdf');

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

  const getCurrentRecipes = (): Recipe[] => {
    switch (activeTab) {
      case 0: return myRecipes;
      case 1: return favoriteRecipes;
      case 2: return publicRecipes;
      default: return [];
    }
  };

  const handleSelectAll = () => {
    const currentRecipes = getCurrentRecipes();
    const currentRecipeIds = currentRecipes.map(r => r.recipeId);

    // If all are selected, unselect all; otherwise select all
    const allSelected = currentRecipeIds.every(id => selectedRecipes.includes(id));
    if (allSelected) {
      setSelectedRecipes([]);
    } else {
      setSelectedRecipes(currentRecipeIds);
    }
  };

  const handleSelectRecipe = (recipeId: number) => {
    setSelectedRecipes(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const getSelectedRecipeData = async (): Promise<Recipe[]> => {
    const selectedData: Recipe[] = [];
    for (const recipeId of selectedRecipes) {
      try {
        const response = await recipeApi.getRecipe(recipeId);
        selectedData.push(response.data);
      } catch (error) {
        console.error(`Error loading recipe ${recipeId}:`, error);
      }
    }
    return selectedData;
  };

  const escapeXml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const handleExportPDF = async () => {
    const recipes = await getSelectedRecipeData();
    if (recipes.length === 0) return;

    const doc = new jsPDF();
    let isFirstRecipe = true;

    recipes.forEach((recipe, recipeIndex) => {
      if (!isFirstRecipe) {
        doc.addPage();
      }
      isFirstRecipe = false;

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(recipe.title, 15, 20);

      // Metadata
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`By ${recipe.createUsername} • Serves ${recipe.servingCount}`, 15, 28);

      let yPosition = 35;

      // Description
      if (recipe.description) {
        doc.setFontSize(10);
        const splitDescription = doc.splitTextToSize(recipe.description, 180);
        doc.text(splitDescription, 15, yPosition);
        yPosition += splitDescription.length * 5 + 5;
      }

      // Ingredients
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Ingredients', 15, yPosition);
      yPosition += 6;

      const ingredientsData = (recipe as any).recipeIngredients?.map((ingredient: any) => {
        const qty = ingredient.quantity != null ? ingredient.quantity + ' ' : '';
        const unit = ingredient.quantity != null ? (ingredient.measurementName || ingredient.measurement?.measurementName || '') + ' ' : '';
        const name = ingredient.ingredientName || ingredient.ingredient?.name || '';
        const prep = ingredient.preparation ? ', ' + ingredient.preparation : '';
        return [`${qty}${unit}${name}${prep}`];
      }) || [];

      autoTable(doc, {
        startY: yPosition,
        body: ingredientsData,
        theme: 'plain',
        styles: { fontSize: 9 },
        margin: { left: 15 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 8;

      // Instructions
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Instructions', 15, yPosition);
      yPosition += 6;

      const stepsData = (recipe as any).recipeSteps?.map((step: any) => [
        step.stepNumber.toString(),
        step.stepText
      ]) || [];

      autoTable(doc, {
        startY: yPosition,
        body: stepsData,
        theme: 'plain',
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 12, fontStyle: 'bold' },
          1: { cellWidth: 'auto' }
        },
        margin: { left: 15 },
      });

      // Notes
      if (recipe.note) {
        yPosition = (doc as any).lastAutoTable.finalY + 8;
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Notes', 15, yPosition);
        yPosition += 6;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const splitNotes = doc.splitTextToSize(recipe.note, 180);
        doc.text(splitNotes, 15, yPosition);
      }
    });

    doc.save('recipes.pdf');
  };

  const handleExportRecipeML = async () => {
    const recipes = await getSelectedRecipeData();
    if (recipes.length === 0) return;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<recipeml version="0.5">\n';

    recipes.forEach(recipe => {
      xml += '  <recipe>\n';
      xml += `    <head>\n`;
      xml += `      <title>${escapeXml(recipe.title)}</title>\n`;
      xml += `      <source>${escapeXml(recipe.createUsername)}</source>\n`;

      let formattedDate = '';
      try {
        const date = new Date(recipe.creationDate);
        formattedDate = !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      } catch {
        formattedDate = new Date().toISOString().split('T')[0];
      }

      xml += `      <date>${formattedDate}</date>\n`;
      xml += `      <yield>${recipe.servingCount} servings</yield>\n`;
      if (recipe.description) {
        xml += `      <description>${escapeXml(recipe.description)}</description>\n`;
      }
      xml += `    </head>\n`;

      xml += '    <ingredients>\n';
      (recipe as any).recipeIngredients?.forEach((ingredient: any) => {
        xml += '      <ing>\n';
        if (ingredient.quantity != null) {
          xml += `        <amt><qty>${ingredient.quantity}</qty></amt>\n`;
        }
        const unit = ingredient.measurementName || ingredient.measurement?.measurementName || '';
        if (unit) {
          xml += `        <unit>${escapeXml(unit)}</unit>\n`;
        }
        const name = ingredient.ingredientName || ingredient.ingredient?.name || '';
        xml += `        <item>${escapeXml(name)}</item>\n`;
        if (ingredient.preparation) {
          xml += `        <prep>${escapeXml(ingredient.preparation)}</prep>\n`;
        }
        xml += '      </ing>\n';
      });
      xml += '    </ingredients>\n';

      xml += '    <directions>\n';
      (recipe as any).recipeSteps?.forEach((step: any) => {
        xml += `      <step>${escapeXml(step.stepText)}</step>\n`;
      });
      xml += '    </directions>\n';

      if (recipe.note) {
        xml += `    <note>${escapeXml(recipe.note)}</note>\n`;
      }

      xml += '  </recipe>\n';
    });

    xml += '</recipeml>';

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recipes.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJsonLd = async () => {
    const recipes = await getSelectedRecipeData();
    if (recipes.length === 0) return;

    const jsonLdArray = recipes.map(recipe => {
      let datePublished = '';
      try {
        const date = new Date(recipe.creationDate);
        datePublished = !isNaN(date.getTime()) ? date.toISOString() : new Date().toISOString();
      } catch {
        datePublished = new Date().toISOString();
      }

      const jsonLd: any = {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: recipe.title,
        author: {
          '@type': 'Person',
          name: recipe.createUsername
        },
        datePublished: datePublished,
        description: recipe.description || '',
        recipeYield: `${recipe.servingCount} servings`,
        recipeIngredient: (recipe as any).recipeIngredients?.map((ingredient: any) => {
          const qty = ingredient.quantity != null ? ingredient.quantity + ' ' : '';
          const unit = ingredient.quantity != null ? (ingredient.measurementName || ingredient.measurement?.measurementName || '') + ' ' : '';
          const name = ingredient.ingredientName || ingredient.ingredient?.name || '';
          const prep = ingredient.preparation ? ', ' + ingredient.preparation : '';
          return `${qty}${unit}${name}${prep}`;
        }) || [],
        recipeInstructions: (recipe as any).recipeSteps?.map((step: any, index: number) => ({
          '@type': 'HowToStep',
          position: index + 1,
          text: step.stepText
        })) || []
      };

      if (recipe.note) {
        jsonLd.comment = recipe.note;
      }

      return jsonLd;
    });

    const json = JSON.stringify(jsonLdArray, null, 2);
    const blob = new Blob([json], { type: 'application/ld+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recipes.jsonld';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      if (exportFormat === 'pdf') {
        await handleExportPDF();
      } else if (exportFormat === 'recipeml') {
        await handleExportRecipeML();
      } else {
        await handleExportJsonLd();
      }
    } catch (error) {
      console.error('Error exporting recipes:', error);
      alert(`Error exporting recipes: ${error}`);
    } finally {
      setExportDialogOpen(false);
    }
  };

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
          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" onClick={handleSelectAll}>
              Select All
            </Button>
          </Box>
          <RecipeTable
            recipes={myRecipes}
            onView={handleViewRecipe}
            onEdit={handleEditRecipe}
            onToggleFavorite={handleToggleFavorite}
            userFavorites={userFavorites}
            canEdit={canEditRecipe}
            showFavoriteButton={false}
            selectedRecipes={selectedRecipes}
            onSelectRecipe={handleSelectRecipe}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button
              variant="contained"
              startIcon={<ExportIcon />}
              onClick={() => setExportDialogOpen(true)}
              disabled={selectedRecipes.length === 0}
            >
              Export... ({selectedRecipes.length} selected)
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" onClick={handleSelectAll}>
              Select All
            </Button>
          </Box>
          <RecipeTable
            recipes={favoriteRecipes}
            onView={handleViewRecipe}
            onEdit={handleEditRecipe}
            onToggleFavorite={handleToggleFavorite}
            userFavorites={userFavorites}
            canEdit={canEditRecipe}
            showFavoriteButton={true}
            selectedRecipes={selectedRecipes}
            onSelectRecipe={handleSelectRecipe}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button
              variant="contained"
              startIcon={<ExportIcon />}
              onClick={() => setExportDialogOpen(true)}
              disabled={selectedRecipes.length === 0}
            >
              Export... ({selectedRecipes.length} selected)
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" onClick={handleSelectAll}>
              Select All
            </Button>
          </Box>
          <RecipeTable
            recipes={publicRecipes}
            onView={handleViewRecipe}
            onEdit={handleEditRecipe}
            onToggleFavorite={handleToggleFavorite}
            userFavorites={userFavorites}
            canEdit={canEditRecipe}
            showFavoriteButton={true}
            selectedRecipes={selectedRecipes}
            onSelectRecipe={handleSelectRecipe}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button
              variant="contained"
              startIcon={<ExportIcon />}
              onClick={() => setExportDialogOpen(true)}
              disabled={selectedRecipes.length === 0}
            >
              Export... ({selectedRecipes.length} selected)
            </Button>
          </Box>
        </TabPanel>
      </Paper>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Selected Recipes</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Select the export format for {selectedRecipes.length} recipe(s):
          </Typography>
          <RadioGroup
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'recipeml' | 'jsonld')}
          >
            <FormControlLabel
              value="pdf"
              control={<Radio />}
              label="PDF (Portable Document Format)"
            />
            <FormControlLabel
              value="recipeml"
              control={<Radio />}
              label="RecipeML (XML format)"
            />
            <FormControlLabel
              value="jsonld"
              control={<Radio />}
              label="JSON-LD (schema.org format)"
            />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default HomePage;