import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";

import StartPage from "./pages/StartPage";
import ExtractPage from "./pages/ExtractPage";
import ExtractResultsPage from "./pages/ExtractResultsPage";
import MonitorPage from "./pages/MonitorPage";
import MonitorResultsPage from "./pages/MonitorResultsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout wrapper */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/start" replace />} />
          <Route path="/start" element={<StartPage />} />
          <Route path="/extract" element={<ExtractPage />} />
          <Route path="/extract/results" element={<ExtractResultsPage />} />
          <Route path="/monitor" element={<MonitorPage />} />
          <Route path="/monitor/results" element={<MonitorResultsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
