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
import { Add as AddIcon, FileDownload as ExportIcon, FileUpload as ImportIcon } from '@mui/icons-material';
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
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportResults(null);
    }
  };

  const parseJsonLd = (content: string): any[] => {
    try {
      const parsed = JSON.parse(content);
      // Handle both single recipe and array of recipes
      const recipes = Array.isArray(parsed) ? parsed : [parsed];

      return recipes.map((recipe: any) => {
        // Extract serving count from recipeYield
        let servingCount = 1;
        if (recipe.recipeYield) {
          const match = recipe.recipeYield.toString().match(/(\d+)/);
          if (match) {
            servingCount = parseInt(match[1]);
          }
        }

        // Parse ingredients
        const ingredients = (recipe.recipeIngredient || []).map((ingStr: string) => {
          // Try to parse "quantity unit ingredient, preparation" format
          const parts = ingStr.split(',');
          const mainPart = parts[0].trim();
          const preparation = parts.length > 1 ? parts.slice(1).join(',').trim() : '';

          const words = mainPart.split(' ');
          let quantity: number | undefined = undefined;
          let measurementName = '';
          let ingredientName = '';

          // Try to parse first word as quantity
          const firstNum = parseFloat(words[0]);
          if (!isNaN(firstNum)) {
            quantity = firstNum;
            // Check if second word is a unit
            if (words.length > 2) {
              measurementName = words[1];
              ingredientName = words.slice(2).join(' ');
            } else if (words.length > 1) {
              ingredientName = words.slice(1).join(' ');
            }
          } else {
            ingredientName = mainPart;
          }

          return {
            quantity,
            measurementName,
            ingredientName,
            preparation
          };
        });

        // Parse steps
        const steps = (recipe.recipeInstructions || []).map((step: any, index: number) => ({
          stepNumber: index + 1,
          stepText: typeof step === 'string' ? step : step.text || ''
        }));

        return {
          title: recipe.name || 'Untitled Recipe',
          description: recipe.description || '',
          servingCount,
          isPublic: false, // Default to private when importing
          note: recipe.comment || '',
          ingredients,
          steps
        };
      });
    } catch (error) {
      console.error('Error parsing JSON-LD:', error);
      throw new Error('Invalid JSON-LD format');
    }
  };

  const parseRecipeML = (content: string): any[] => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'text/xml');

      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML format');
      }

      const recipeNodes = xmlDoc.querySelectorAll('recipe');
      const recipes: any[] = [];

      recipeNodes.forEach((recipeNode) => {
        const title = recipeNode.querySelector('title')?.textContent || 'Untitled Recipe';
        const description = recipeNode.querySelector('description')?.textContent || '';
        const note = recipeNode.querySelector('note')?.textContent || '';

        // Parse yield
        let servingCount = 1;
        const yieldText = recipeNode.querySelector('yield')?.textContent || '';
        const yieldMatch = yieldText.match(/(\d+)/);
        if (yieldMatch) {
          servingCount = parseInt(yieldMatch[1]);
        }

        // Parse ingredients
        const ingredients: any[] = [];
        const ingNodes = recipeNode.querySelectorAll('ing');
        ingNodes.forEach((ingNode) => {
          const qtyNode = ingNode.querySelector('qty');
          const quantity = qtyNode ? parseFloat(qtyNode.textContent || '') : undefined;
          const measurementName = ingNode.querySelector('unit')?.textContent || '';
          const ingredientName = ingNode.querySelector('item')?.textContent || '';
          const preparation = ingNode.querySelector('prep')?.textContent || '';

          ingredients.push({
            quantity: !isNaN(quantity as number) ? quantity : undefined,
            measurementName,
            ingredientName,
            preparation
          });
        });

        // Parse steps
        const steps: any[] = [];
        const stepNodes = recipeNode.querySelectorAll('step');
        stepNodes.forEach((stepNode, index) => {
          steps.push({
            stepNumber: index + 1,
            stepText: stepNode.textContent || ''
          });
        });

        recipes.push({
          title,
          description,
          servingCount,
          isPublic: false, // Default to private when importing
          note,
          ingredients,
          steps
        });
      });

      return recipes;
    } catch (error) {
      console.error('Error parsing RecipeML:', error);
      throw new Error('Invalid RecipeML format');
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportResults(null);

    try {
      const content = await importFile.text();
      let recipes: any[] = [];

      // Determine file type and parse
      if (importFile.name.endsWith('.json') || importFile.name.endsWith('.jsonld')) {
        recipes = parseJsonLd(content);
      } else if (importFile.name.endsWith('.xml')) {
        recipes = parseRecipeML(content);
      } else {
        throw new Error('Unsupported file format. Please use .json, .jsonld, or .xml files.');
      }

      // Import each recipe
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (const recipe of recipes) {
        try {
          await recipeApi.createRecipe(recipe);
          successCount++;
        } catch (error: any) {
          failedCount++;
          const errorMsg = `Failed to import "${recipe.title}": ${error.response?.data?.message || error.message}`;
          errors.push(errorMsg);
          console.error(errorMsg, error);
        }
      }

      setImportResults({
        success: successCount,
        failed: failedCount,
        errors
      });

      // Reload recipes if any were successful
      if (successCount > 0) {
        await loadRecipes();
      }
    } catch (error: any) {
      setImportResults({
        success: 0,
        failed: 0,
        errors: [error.message || 'Failed to parse import file']
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
    setImportFile(null);
    setImportResults(null);
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ImportIcon />}
                onClick={() => setImportDialogOpen(true)}
              >
                Import...
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ImportIcon />}
                onClick={() => setImportDialogOpen(true)}
              >
                Import...
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ImportIcon />}
                onClick={() => setImportDialogOpen(true)}
              >
                Import...
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

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={handleCloseImportDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Import Recipes</DialogTitle>
        <DialogContent>
          {!importResults ? (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Select a JSON-LD (.json, .jsonld) or RecipeML (.xml) file to import recipes.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <input
                  accept=".json,.jsonld,.xml"
                  style={{ display: 'none' }}
                  id="import-file-input"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="import-file-input">
                  <Button variant="outlined" component="span" fullWidth>
                    Choose File
                  </Button>
                </label>
                {importFile && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Selected: {importFile.name}
                  </Typography>
                )}
              </Box>
            </>
          ) : (
            <Box>
              <Alert severity={importResults.failed === 0 ? 'success' : importResults.success === 0 ? 'error' : 'warning'} sx={{ mb: 2 }}>
                {importResults.success > 0 && `Successfully imported ${importResults.success} recipe(s). `}
                {importResults.failed > 0 && `Failed to import ${importResults.failed} recipe(s).`}
              </Alert>
              {importResults.errors.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Errors:
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {importResults.errors.map((error, index) => (
                      <Typography key={index} variant="body2" color="error" sx={{ mb: 0.5 }}>
                        • {error}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportDialog}>
            {importResults ? 'Close' : 'Cancel'}
          </Button>
          {!importResults && (
            <Button
              onClick={handleImport}
              variant="contained"
              disabled={!importFile || isImporting}
            >
              {isImporting ? <CircularProgress size={24} /> : 'Import'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default HomePage;