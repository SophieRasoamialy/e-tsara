import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = Cookies.get("token");
    console.log("Token from cookies::::::::::::::::::::::::::::", token); // Debugging line
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded token:::::::::::::::::::::::::::::", decodedToken); // Debugging line
        setIsAuthenticated(true);
        setUserRole(decodedToken.role);
        console.log("User role:::::::::::::::::::::::::::::", userRole); // Debugging line
      } catch (error) {
        console.error("Erreur lors du décodage du token:", error);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, [userRole]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
