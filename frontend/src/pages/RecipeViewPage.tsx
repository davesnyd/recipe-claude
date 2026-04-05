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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import {
  Edit as EditIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { recipeApi } from '../services/api';
import { Recipe } from '../types';
import { getMeasurementDisplay } from '../utils/ingredientUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { slugify, acquireSaveFileHandle, writeToFileHandle } from '../utils/exportUtils';

const RecipeViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'recipeml' | 'jsonld'>('pdf');
  const [exportFilename, setExportFilename] = useState('recipe.pdf');
  const [pdfFontSize, setPdfFontSize] = useState<'small' | 'medium' | 'large'>('small');

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
      setExportFilename(`${slugify(recipeResponse.data.title)}.pdf`);

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

  const escapeXml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const generatePDFBlob = async (): Promise<Blob | null> => {
    if (!recipe) return null;

    const scale = pdfFontSize === 'large' ? 2.0 : pdfFontSize === 'medium' ? 1.4 : 1.0;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(20 * scale);
    doc.setFont('helvetica', 'bold');
    doc.text(recipe.title, 15, 20);

    // Metadata
    doc.setFontSize(10 * scale);
    doc.setFont('helvetica', 'normal');
    const pdfDate = recipe.creationDate ? new Date(recipe.creationDate) : null;
    const pdfDateStr = pdfDate && !isNaN(pdfDate.getTime()) ? ` • Created ${pdfDate.toLocaleDateString()}` : '';
    doc.text(`By ${recipe.createUsername}${pdfDateStr}`, 15, 28);
    doc.text(`Serves ${recipe.servingCount}`, 15, 34);

    // Description
    if (recipe.description) {
      doc.setFontSize(11 * scale);
      const splitDescription = doc.splitTextToSize(recipe.description, 180);
      doc.text(splitDescription, 15, 42);
    }

    let yPosition = recipe.description ? 42 + (doc.splitTextToSize(recipe.description, 180).length * 5) + 10 : 45;

    // Ingredients
    doc.setFontSize(14 * scale);
    doc.setFont('helvetica', 'bold');
    doc.text('Ingredients', 15, yPosition);
    yPosition += 8;

    const ingredientsData = (recipe as any).recipeIngredients?.map((ingredient: any) => {
      const qty = ingredient.quantity != null ? ingredient.quantity + ' ' : '';
      const unitName = getMeasurementDisplay(ingredient.measurementName || ingredient.measurement?.measurementName);
      const unit = ingredient.quantity != null && unitName ? unitName + ' ' : '';
      const name = ingredient.ingredientName || ingredient.ingredient?.name || '';
      const prep = ingredient.preparation ? ', ' + ingredient.preparation : '';
      return [`${qty}${unit}${name}${prep}`];
    }) || [];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: ingredientsData,
      theme: 'plain',
      styles: { fontSize: 10 * scale },
      margin: { left: 15 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Instructions
    doc.setFontSize(14 * scale);
    doc.setFont('helvetica', 'bold');
    doc.text('Instructions', 15, yPosition);
    yPosition += 8;

    const stepsData = (recipe as any).recipeSteps?.map((step: any) => [
      step.stepNumber.toString(),
      step.stepText
    ]) || [];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: stepsData,
      theme: 'plain',
      styles: { fontSize: 10 * scale },
      columnStyles: {
        0: { cellWidth: 15, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 15 },
    });

    // Notes
    if (recipe.note) {
      yPosition = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14 * scale);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', 15, yPosition);
      yPosition += 8;

      doc.setFontSize(10 * scale);
      doc.setFont('helvetica', 'normal');
      const splitNotes = doc.splitTextToSize(recipe.note, 180);
      doc.text(splitNotes, 15, yPosition);
    }

    return doc.output('blob') as Blob;
  };

  const generateRecipeMLBlob = async (): Promise<Blob | null> => {
    console.log('handleExportRecipeML: Starting RecipeML export');
    if (!recipe) {
      console.error('handleExportRecipeML: No recipe data available');
      return;
    }

    try {
      console.log('handleExportRecipeML: Recipe data:', recipe);

      // Safely format date
      let formattedDate = '';
      try {
        const date = new Date(recipe.creationDate);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        } else {
          formattedDate = new Date().toISOString().split('T')[0];
          console.warn('handleExportRecipeML: Invalid creationDate, using current date');
        }
      } catch (dateError) {
        formattedDate = new Date().toISOString().split('T')[0];
        console.warn('handleExportRecipeML: Error parsing date, using current date:', dateError);
      }

      // Create RecipeML XML format
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<recipeml version="0.5">\n';
      xml += '  <recipe>\n';
      xml += `    <head>\n`;
      xml += `      <title>${escapeXml(recipe.title)}</title>\n`;
      xml += `      <source>${escapeXml(recipe.createUsername)}</source>\n`;
      xml += `      <date>${formattedDate}</date>\n`;
      xml += `      <yield>${recipe.servingCount} servings</yield>\n`;
      if (recipe.description) {
        xml += `      <description>${escapeXml(recipe.description)}</description>\n`;
      }
      xml += `    </head>\n`;

      // Ingredients
      xml += '    <ingredients>\n';
      (recipe as any).recipeIngredients?.forEach((ingredient: any) => {
        xml += '      <ing>\n';
        if (ingredient.quantity != null) {
          xml += `        <amt><qty>${ingredient.quantity}</qty></amt>\n`;
        }
        const unit = getMeasurementDisplay(ingredient.measurementName || ingredient.measurement?.measurementName);
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

      // Directions
      xml += '    <directions>\n';
      (recipe as any).recipeSteps?.forEach((step: any) => {
        xml += `      <step>${escapeXml(step.stepText)}</step>\n`;
      });
      xml += '    </directions>\n';

      // Notes
      if (recipe.note) {
        xml += `    <note>${escapeXml(recipe.note)}</note>\n`;
      }

      xml += '  </recipe>\n';
      xml += '</recipeml>';

      console.log('handleExportRecipeML: Generated XML:', xml.substring(0, 200) + '...');

      console.log('generateRecipeMLBlob: Generated XML, returning blob');
      return new Blob([xml], { type: 'application/xml' });
    } catch (error) {
      console.error('handleExportRecipeML: Error during export:', error);
      alert(`Error exporting RecipeML: ${error}`);
      throw error;
    }
  };

  const generateJsonLdBlob = async (): Promise<Blob | null> => {
    console.log('handleExportJsonLd: Starting JSON-LD export');
    if (!recipe) {
      console.error('handleExportJsonLd: No recipe data available');
      return;
    }

    try {
      console.log('handleExportJsonLd: Recipe data:', recipe);

      // Safely format date
      let datePublished = '';
      try {
        const date = new Date(recipe.creationDate);
        if (!isNaN(date.getTime())) {
          datePublished = date.toISOString();
        } else {
          datePublished = new Date().toISOString();
          console.warn('handleExportJsonLd: Invalid creationDate, using current date');
        }
      } catch (dateError) {
        datePublished = new Date().toISOString();
        console.warn('handleExportJsonLd: Error parsing date, using current date:', dateError);
      }

      // Create JSON-LD format using schema.org Recipe
      const jsonLd = {
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
          const unitName = getMeasurementDisplay(ingredient.measurementName || ingredient.measurement?.measurementName);
          const unit = ingredient.quantity != null && unitName ? unitName + ' ' : '';
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
        (jsonLd as any).comment = recipe.note;
      }

      console.log('handleExportJsonLd: Generated JSON-LD:', jsonLd);

      const json = JSON.stringify(jsonLd, null, 2);
      console.log('generateJsonLdBlob: Returning blob');
      return new Blob([json], { type: 'application/ld+json' });
    } catch (error) {
      console.error('handleExportJsonLd: Error during export:', error);
      alert(`Error exporting JSON-LD: ${error}`);
      throw error;
    }
  };

  const handleExport = async () => {
    // Acquire the file handle FIRST while the user-gesture activation is valid.
    const handle = await acquireSaveFileHandle(exportFilename);
    if (handle === undefined) {
      setExportDialogOpen(false);
      return; // user cancelled the picker
    }

    try {
      let blob: Blob | null = null;
      if (exportFormat === 'pdf') {
        blob = await generatePDFBlob();
      } else if (exportFormat === 'recipeml') {
        blob = await generateRecipeMLBlob();
      } else {
        blob = await generateJsonLdBlob();
      }
      if (blob) await writeToFileHandle(handle, blob, exportFilename);
    } catch (error) {
      console.error('handleExport: Error during export:', error);
    } finally {
      setExportDialogOpen(false);
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
                {(() => {
                  const d = recipe.creationDate ? new Date(recipe.creationDate) : null;
                  const dateStr = d && !isNaN(d.getTime()) ? ` • Created ${d.toLocaleDateString()}` : '';
                  return `By ${recipe.createUsername}${dateStr}`;
                })()}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip label={`Serves ${recipe.servingCount}`} color="primary" variant="outlined" />
                {recipe.isPublic && <Chip label="Public" color="success" variant="outlined" />}
                {recipe.course && <Chip label={recipe.course} variant="outlined" />}
                {recipe.category && <Chip label={recipe.category} variant="outlined" />}
                {recipe.cuisine && <Chip label={recipe.cuisine} variant="outlined" />}
                {recipe.holiday && <Chip label={recipe.holiday} variant="outlined" />}
                {recipe.type && recipe.type.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                  <Chip key={t} label={t} size="small" variant="outlined" />
                ))}
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
                          primary={(() => {
                            const qty = ingredient.quantity != null ? ingredient.quantity + ' ' : '';
                            const unitName = getMeasurementDisplay(ingredient.measurementName || ingredient.measurement?.measurementName);
                            const unit = ingredient.quantity != null && unitName ? unitName + ' ' : '';
                            const name = ingredient.ingredientName || ingredient.ingredient?.name || '';
                            const prep = ingredient.preparation ? ', ' + ingredient.preparation : '';
                            return `${qty}${unit}${name}${prep}`;
                          })()}
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
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={() => setExportDialogOpen(true)}
              >
                Export...
              </Button>
              <IconButton>
                <ShareIcon />
              </IconButton>
              <IconButton>
                <PrintIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>

        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
          <DialogTitle>Export Recipe</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Select the export format:
            </Typography>
            <RadioGroup
              value={exportFormat}
              onChange={(e) => {
                const fmt = e.target.value as 'pdf' | 'recipeml' | 'jsonld';
                setExportFormat(fmt);
                const ext = fmt === 'pdf' ? 'pdf' : fmt === 'recipeml' ? 'xml' : 'json';
                const base = recipe ? slugify(recipe.title) : 'recipe';
                setExportFilename(`${base}.${ext}`);
              }}
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
            <TextField
              label="Filename"
              value={exportFilename}
              onChange={(e) => setExportFilename(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
              inputProps={{ 'aria-label': 'Filename' }}
            />
            {exportFormat === 'pdf' && (
              <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                <InputLabel id="pdf-font-size-label">Font size</InputLabel>
                <Select
                  labelId="pdf-font-size-label"
                  label="Font size"
                  value={pdfFontSize}
                  onChange={(e) => setPdfFontSize(e.target.value as 'small' | 'medium' | 'large')}
                >
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                </Select>
              </FormControl>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} variant="contained">
              Export
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default RecipeViewPage;
