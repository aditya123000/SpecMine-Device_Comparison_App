import React from "react";
import { Outlet } from "react-router-dom";
import { CompareProvider } from "../Pages/Compare/context/CompareContext";
import { ThemeProvider } from "../context/ThemeContext";

const AppLayout = () => {
  return (
    <ThemeProvider>
      <CompareProvider>
        <Outlet />
      </CompareProvider>
    </ThemeProvider>
  );
};

export default AppLayout;
