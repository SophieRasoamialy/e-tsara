import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const refreshAuth = () => {
    const token = Cookies.get("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setIsAuthenticated(true);
        setUserRole(decodedToken.role);
      } catch (error) {
        console.error("Erreur lors du décodage du token:", error);
        Cookies.remove("token");
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  };

  const setAuthToken = (token) => {
    Cookies.set("token", token, {
      expires: 1,
      sameSite: "Lax",
      secure: false,
    });
    refreshAuth();
  };

  const clearAuth = () => {
    Cookies.remove("token");
    setIsAuthenticated(false);
    setUserRole(null);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userRole, refreshAuth, setAuthToken, clearAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
