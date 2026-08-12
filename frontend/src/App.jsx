import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./Layouts/MainLayout";
import AppLayout from "./Layouts/AppLayout";
import Home from "./pages/Home";
import PhonesPage from "./pages/devices/sections/PhonesPage";
import LaptopsPage from "./pages/devices/sections/LaptopsPage";
import TabletsPage from "./pages/devices/sections/TabletsPage";
import EarbudsPage from "./pages/devices/sections/EarbudsPage";
import HeadphonesPage from "./pages/devices/sections/HeadphonesPage";
import TVsPage from "./pages/devices/sections/TVsPage";
import Compare from "./pages/compare/Compare";
import NotFound from "./pages/NotFound";
import DeviceDetailsPage from "./pages/deviceDetails/deviceDetailsPage";
import AuthPage from "./pages/auth/AuthPage";
import ProfilePage from "./pages/auth/ProfilePage";

const router = createBrowserRouter([
  {
    element:<AppLayout/>,
    children:[
      {
        element: <MainLayout />,
        children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/devices",
          element: <PhonesPage />,
        },
        {
          path: "/devices/laptops",
          element: <LaptopsPage />,
        },
        {
          path: "/devices/tablets",
          element: <TabletsPage />,
        },
        {
          path: "/devices/earbuds",
          element: <EarbudsPage />,
        },
        {
          path: "/devices/headphones",
          element: <HeadphonesPage />,
        },
        {
          path: "/devices/tvs",
          element: <TVsPage />,
        },
        {
          path: "/compare", 
          element: <Compare /> 
        },
        {
          path: "/login",
          element: <AuthPage mode="login" />,
        },
        {
          path: "/register",
          element: <AuthPage mode="register" />,
        },
        {
          path: "/profile",
          element: <ProfilePage />,
        },
        {
          path:"/devices/:id",
          element:<DeviceDetailsPage />,
        },
        {
          path:"*",
          element:<NotFound title="404" message="This page does not exist."/>
        }
      ],
    },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
