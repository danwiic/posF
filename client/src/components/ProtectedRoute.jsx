import { Navigate } from 'react-router-dom';
import { useUser } from '../Context/UserContext';

const ProtectedRoute = ({ element, allowedRoles, redirectPath = '/pos' }) => {
  const { user } = useUser();

  if (!user) {
    // User is not logged in
    return <Navigate to="/" />;
  }

  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    return <Navigate to={redirectPath} />;
  }

  return element;
};

export default ProtectedRoute;
