import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ element, requiredRoles }) => {
  const { isAuthenticated, userRole } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();

  // Utilisez useEffect pour surveiller les changements dans isAuthenticated et userRole
  useEffect(() => {
    if (isAuthenticated !== null && userRole !== null) {
      setIsReady(true);
    }
  }, [isAuthenticated, userRole]);


  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isReady) {
        console.log("Redirection vers l'authentification après un délai");
        console.log("isAuthenticated is false");
        navigate("/login");
      }
    }, 10000); // 10000 ms = 10 secondes

    return () => clearTimeout(timer); 
  }, [isReady]);

  console.log("element::::::::::::::", element);
  console.log("requiredRoles::::::::::::", requiredRoles);
  console.log("isAuthenticated::::::::::::", isAuthenticated);
  console.log("userRole::::::::::::", userRole);

  // Attendez que les états soient prêts avant de rendre le composant
  if (!isReady) {
    return <div>Loading...</div>; 
  }

  if (!isAuthenticated) {
    console.log("isAuthenticated is false::::", isAuthenticated);
    return <Navigate to="/login" />;
  }

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return element;
};

export default PrivateRoute;
