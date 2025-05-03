import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CompanyHeader from "components/CompanyHeader";
import { checkToken } from "services/settings";
import Loading from "components/ui/Loading";

// Criação do contexto
const RevalidateTokenContext = createContext();

// Provedor do contexto
export const RevalidateTokenProvider = ({ children }) => {
  const [tokenData, setTokenData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const tokenData = await window.api.getTokenData();
      if (!tokenData?.token?.id) {
        navigate("/setup");
        return;
      }

      const lastCheck = new Date(tokenData.lastCheck);
      const today = new Date();

      if (today.toDateString() !== lastCheck.toDateString()) {
        try {
          const data = await checkToken(
            tokenData.token.clientToken,
            tokenData.token.clientSecretToken
          );

          if (!data?.id) {
            navigate("/setup");
          } else {
            setTokenData(data);
            window.api.saveTokenData({
              token: data,
              info: "dados da empresa no servidor",
            });
          }
        } catch (error) {
          window.api.saveTokenData(null);
        }
      } else {
        setTokenData(tokenData);
      }
    };

    load();
  }, []);

  if (!tokenData?.token?.id) return <Loading />;

  return (
    <RevalidateTokenContext.Provider value={{ tokenData, setTokenData }}>
      <div>
        <CompanyHeader {...tokenData} onChangeToken={setTokenData} />

        {children}
      </div>
    </RevalidateTokenContext.Provider>
  );
};

// Hook para usar o contexto
export const useRevalidateToken = () => {
  const context = useContext(RevalidateTokenContext);
  if (!context) {
    throw new Error(
      "useRevalidateToken deve ser usado dentro de um RevalidateTokenProvider"
    );
  }
  return context;
};
