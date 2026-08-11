import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import AddAnime from '../pages/AddAnime';
import Library from '../pages/Library';
import About from '../pages/About';
import PublicRoute from '../components/PublicRoute';
import ProtectedRoute from '../components/ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}

      <Route
        path="/"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* Accessible to everyone */}

      <Route path="/about" element={<About />} />

      {/* PROTECTED ROUTES */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <Library />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-anime"
        element={
          <ProtectedRoute>
            <AddAnime />
          </ProtectedRoute>
        }
      />

      {/* NOT FOUND */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
