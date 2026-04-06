/** @format */

import { createBrowserRouter } from 'react-router';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Layout from '../components/Layout';
import About from '../pages/About';
import ProtectedRoute from '../components/ProtectedRoute';
import Dashboard from '../pages/Dashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'about',
        element: (
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
