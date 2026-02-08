import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    //remember me. ik, local storage this local storage. We'll use the APP thingy
    return (
      localStorage.getItem('isAuthenticated') === 'true' ||
      sessionStorage.getItem('isAuthenticated') === 'true'
    );
  });

  const login = (email, password, rememberMe = false) => {
    console.log('Login:', { email, password });
    setIsAuthenticated(true);
    if (rememberMe) {
      // Persist across tabs/restarts.
      localStorage.setItem('isAuthenticated', 'true');
      sessionStorage.removeItem('isAuthenticated');
    } else {
      // Clear on browser close.
      sessionStorage.setItem('isAuthenticated', 'true');
      localStorage.removeItem('isAuthenticated');
    }
  };

  const bypass = () => {
    // Dev-mode login without credentials.
    setIsAuthenticated(true);
    sessionStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('isAuthenticated');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, bypass, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
