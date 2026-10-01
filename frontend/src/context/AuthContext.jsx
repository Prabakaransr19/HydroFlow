import React, { createContext, useContext, useState, useEffect } from 'react';
import { extractRoleFromToken, normalizeRole, isTokenExpired } from '../utils/jwt';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  // Extract role dynamically from user object or JWT token claims
  const role = React.useMemo(() => {
    if (user?.role) return normalizeRole(user.role);
    if (user?.roles?.[0]) return normalizeRole(user.roles[0]);
    if (token) return extractRoleFromToken(token);
    return null;
  }, [user, token]);

  // Clean expired token on init
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, [token]);

  const login = (newToken, userData = null) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);

    // Derive role if missing from explicit userData
    const tokenRole = extractRoleFromToken(newToken);
    const updatedUser = {
      ...(userData || {}),
      role: normalizeRole(userData?.role || tokenRole),
    };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updates) => {
    setUser((currentUser) => {
      const updatedUser = { ...(currentUser || {}), ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const isAuthenticated = Boolean(token);

  const getDashboardPath = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '/dashboard/admin';
      case 'COMMUNITY_ADMIN':
        return '/dashboard/community';
      case 'RESIDENT':
        return '/dashboard/resident';
      default:
        return '/login';
    }
  };

  const hasRole = (allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        user, 
        role, 
        isAuthenticated, 
        login, 
        logout,
        updateUser,
        getDashboardPath, 
        hasRole 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

