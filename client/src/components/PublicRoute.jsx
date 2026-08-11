import { Navigate } from 'react-router-dom';

function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
}
export default PublicRoute;
