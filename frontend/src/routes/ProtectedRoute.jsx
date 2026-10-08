import { Navigate, useLocation } from 'react-router-dom';

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('text2sql_auth_token');

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}