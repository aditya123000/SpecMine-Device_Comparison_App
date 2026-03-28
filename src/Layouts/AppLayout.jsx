import React from "react";
import { Outlet } from "react-router-dom";
import { CompareProvider } from "../Pages/Compare/context/CompareContext";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

const AppLayout = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CompareProvider>
          <Outlet />
        </CompareProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default AppLayout;
