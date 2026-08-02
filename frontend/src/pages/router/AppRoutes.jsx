import { Routes, Route } from "react-router-dom";
import DevicesPage from "@/Pages/Devices/DevicesPage";
import DeviceDetailsPage from "@/Pages/DeviceDetails/DeviceDetailsPage";
import ComparePage from "@/Pages/Compare/ComparePage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/devices" element={<DevicesPage />} />
      <Route path="/devices/:id" element={<DeviceDetailsPage />} />
      <Route path="/compare" element={<ComparePage />} />
    </Routes>
  );
};

export default AppRoutes;
