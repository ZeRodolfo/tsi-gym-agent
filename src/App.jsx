import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import MainPage from "./pages/MainPage";
import SetupPage from "./pages/SetupPage";
import ParametersPage from "./pages/ParametersPage";
import { RevalidateTokenProvider } from "contexts/RevalidateToken";
import { SocketProvider } from "contexts/Socket";
import { SocketLocalProvider } from "contexts/SocketLocal";

function App() {
  return (
    <SocketProvider>
      <SocketLocalProvider>
        <ToastContainer />
        <Router>
          <Routes>
            <Route
              path="/main"
              element={
                <RevalidateTokenProvider>
                  <MainPage />
                </RevalidateTokenProvider>
              }
            />
            <Route path="/setup" element={<SetupPage />} />
            <Route
              path="/parameters"
              element={
                <RevalidateTokenProvider>
                  <ParametersPage />
                </RevalidateTokenProvider>
              }
            />
            <Route path="*" element={<Navigate to="/setup" />} />
          </Routes>
        </Router>
      </SocketLocalProvider>
    </SocketProvider>
  );
}

export default App;
