import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import MainPage from "./pages/MainPage";
import SetupPage from "./pages/SetupPage";
import ParametersPage from "./pages/ParametersPage";
import { RevalidateTokenProvider } from "contexts/RevalidateToken";
import { SocketProvider } from "contexts/Socket";
import { SocketLocalProvider } from "contexts/SocketLocal";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
              {/* Fallback apenas se não reconhecer nenhuma rota */}
              <Route path="*" element={<Navigate to="/setup" replace />} />
            </Routes>
          </Router>
        </SocketLocalProvider>
      </SocketProvider>
    </QueryClientProvider>
  );
}

export default App;
