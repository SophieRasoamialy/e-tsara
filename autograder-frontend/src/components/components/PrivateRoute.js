import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 

const PrivateRoute = ({ element, ...rest }) => {
  const { isAuthenticated } = useAuth(); // Assurez-vous que cette méthode retourne l'état d'authentification

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
