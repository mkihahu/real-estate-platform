import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/shared/LandingPage";
import Properties from "./pages/shared/Properties";
import PropertyDetails from "./pages/shared/PropertyDetails";
import Register from "./pages/auth/Register";

const HomePage = () => {
  return (
    <div>
      <Routes>
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<LandingPage />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
      </Routes>
    </div>
  );
};

export default HomePage;
