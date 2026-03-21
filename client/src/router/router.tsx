/** @format */

import { createBrowserRouter } from 'react-router';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Layout from '../components/Layout';

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
    ],
  },
]);

export default router;
