
import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirect from the index route to the landing page
const Index = () => {
  return <Navigate to="/landing" replace />;
};

export default Index;
