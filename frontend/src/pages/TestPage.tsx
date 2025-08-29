import React from 'react';
import { Box, Typography } from '@mui/material';
import Layout from '../components/Layout';

const TestPage: React.FC = () => {
  console.log('TestPage: Component rendered successfully!');
  
  return (
    <Layout>
      <Box sx={{ maxWidth: 800, mx: 'auto', py: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          Test Page - This should work!
        </Typography>
        <Typography variant="body1">
          If you can see this page, routing is working correctly.
        </Typography>
      </Box>
    </Layout>
  );
};

export default TestPage;