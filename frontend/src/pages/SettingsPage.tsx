import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';

const SettingsPage: React.FC = () => {
  const { user, login } = useAuth();
  const [measurementPreference, setMeasurementPreference] = useState<'Imperial' | 'Metric'>(
    user?.measurementPreference || 'Imperial'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await authApi.updateCurrentUser({
        measurementPreference,
      });

      // Update the auth context with the new user data
      // Since we don't have a token refresh, we'll need to manually update
      // For now, just show success
      setSuccess(true);

      // Reload the page to refresh user data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('Error updating settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = measurementPreference !== user?.measurementPreference;

  return (
    <Layout title="Settings">
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            User Preferences
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Settings saved successfully! Refreshing...
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Account Information
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Email:</strong> {user?.username}
            </Typography>
            <Typography variant="body1">
              <strong>Account Created:</strong>{' '}
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Measurement System</Typography>
                <Typography variant="caption" color="text.secondary">
                  Choose your preferred measurement system for recipes
                </Typography>
              </FormLabel>
              <RadioGroup
                value={measurementPreference}
                onChange={(e) => setMeasurementPreference(e.target.value as 'Imperial' | 'Metric')}
              >
                <FormControlLabel
                  value="Imperial"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Imperial</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Cups, tablespoons, teaspoons, ounces, pounds, etc.
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="Metric"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Metric</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Grams, kilograms, milliliters, liters, etc.
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default SettingsPage;
