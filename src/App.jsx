import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./Layouts/MainLayout";
import AppLayout from "./Layouts/AppLayout";
import Home from "./Pages/Home";
import PhonesPage from "./Pages/Devices/sections/PhonesPage";
import LaptopsPage from "./Pages/Devices/sections/LaptopsPage";
import TabletsPage from "./Pages/Devices/sections/TabletsPage";
import EarbudsPage from "./Pages/Devices/sections/EarbudsPage";
import HeadphonesPage from "./Pages/Devices/sections/HeadphonesPage";
import TVsPage from "./Pages/Devices/sections/TVsPage";
import Compare from "./Pages/Compare/Compare";
import NotFound from "./Pages/NotFound";
import DeviceDetailsPage from "./Pages/DeviceDetails/DeviceDetailsPage";

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
