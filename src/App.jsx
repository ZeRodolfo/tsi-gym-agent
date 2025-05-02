import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import SetupPage from "./pages/SetupPage";
import ParametersPage from "./pages/ParametersPage";

function App() {
  return (
    <>
      <ToastContainer />
      <Router>
        <Routes>
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/parameters" element={<ParametersPage />} />
          <Route path="*" element={<Navigate to="/setup" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
