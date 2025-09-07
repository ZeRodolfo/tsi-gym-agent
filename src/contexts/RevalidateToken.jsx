import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CompanyHeader from "components/CompanyHeader";
import { validateTokens } from "services/catracas";
import Loading from "components/ui/Loading";
import { io, Socket } from "socket.io-client";
// import { toast } from "sonner";

const RevalidateTokenContext = createContext(null);

export const RevalidateTokenProvider = ({ children }) => {
  const [tokenData, setTokenData] = useState(null);
  const navigate = useNavigate();

  // 🔹 Carrega e valida token salvo localmente
  const loadToken = async () => {
    const localToken = await window.api.getTokenData();

    if (!localToken?.id) {
      navigate("/setup");
      return null;
    }

    const machineKey = await window.system.getMachineId();
    const lastCheck = new Date(localToken.lastCheck);
    const today = new Date();

    // 🔹 Só valida uma vez por dia no servidor
    if (today.toDateString() !== lastCheck.toDateString()) {
      try {
        const validated = await validateTokens(
          localToken.tokens.clientId,
          localToken.tokens.clientSecret,
          { key: machineKey, name: "PC name" }
        );

        if (!validated?.id) {
          navigate("/setup");
          return null;
        }

        const updatedData = { ...validated, tokens: localToken.tokens };
        setTokenData(updatedData);

        await window.api.saveTokenData({
          ...updatedData,
          lastCheck: new Date().toISOString(),
        });

        return updatedData;
      } catch (err) {
        console.error("Erro ao validar token:", err);
        navigate("/setup");
        return null;
      }
    }

    setTokenData(localToken);
    return localToken;
  };

  useEffect(() => {
    loadToken();
  }, []);

  if (!tokenData?.id) return <Loading />;

  return (
    <RevalidateTokenContext.Provider value={{ data: tokenData, setTokenData }}>
      <CompanyHeader {...tokenData} onChangeToken={setTokenData} />
      {children}
    </RevalidateTokenContext.Provider>
  );
};

export const useRevalidateToken = () => {
  const context = useContext(RevalidateTokenContext);
  if (!context) {
    throw new Error(
      "useRevalidateToken deve ser usado dentro de um RevalidateTokenProvider"
    );
  }
  return context;
};
