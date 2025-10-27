import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import CompanyHeader from "components/CompanyHeader";
import { getCatraca } from "services/catracas";
import { getAgent, validateAgentTokens } from "services/agents";
// import { getSettings } from "services/settings";
import Loading from "components/ui/Loading";
import { toast } from "react-toastify";
import { startOfDay } from "date-fns";
import { fetchSync, sendSyncHistoricAccess } from "services/sync";
import { useQuery } from "@tanstack/react-query";

const RevalidateTokenContext = createContext(null);

export const RevalidateTokenProvider = ({ children }) => {
  const [tokenData, setTokenData] = useState(null);
  const [sync, setSync] = useState(false);
  const navigate = useNavigate();

  const { data: catraca } = useQuery({
    queryKey: ["catraca-default"],
    queryFn: getCatraca,
    initialData: null, // opcional, começa vazio
  });

  const handleSync = useCallback(
    async (content = null) => {
      setSync(true);

      try {
        let canSync = !!content?.id;
        if (!content) {
          const machineKey = await window.system.getMachineId();
          const { data } = await validateAgentTokens({
            clientId: tokenData?.clientId,
            clientSecret: tokenData?.clientSecret,
            machineKey,
            machineName: "PC Name",
          });

          canSync = !!data?.id;
          setTokenData(data);
        } else {
          setTokenData((state) => ({ ...state, lastSync: new Date() }));
        }

        if (canSync) {
          const isMainPage = window.location.href?.includes("/main");
          if (!isMainPage) navigate("/main");

          await fetchSync();
          await sendSyncHistoricAccess();

          toast.success("Sincronização realizada com sucesso!");
        }
      } catch (error) {
        console.log("err", error);
        toast.error("Erro ao sincronizar. Por favor, tente novamente.");
      } finally {
        setSync(false);
      }
    },
    [tokenData]
  );

  // 🔹 Carrega e valida token salvo localmente
  const loadToken = async () => {
    const { data: agent } = await getAgent();

    if (!agent?.id) {
      navigate("/setup");
      return null;
    }
    setTokenData(agent);

    const machineKey = await window.system.getMachineId();
    const today = startOfDay(new Date());
    const lastSync = startOfDay(agent?.lastSync);

    // 🔹 Só valida uma vez por dia no servidor
    if (today?.getTime() > lastSync?.getTime()) {
      try {
        const { data: validated } = await validateAgentTokens({
          clientId: agent.clientId,
          clientSecret: agent.clientSecret,
          machineKey,
        });

        if (!validated?.id) {
          navigate("/setup");
          return null;
        }

        handleSync(validated);
        return agent;
      } catch (err) {
        console.error("Erro ao validar token:", err);
        navigate("/setup");
        return null;
      }
    }
  };

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    let heartbeat;

    if (tokenData) {
      heartbeat = setInterval(async () => {
        const today = startOfDay(new Date());
        const lastSync = startOfDay(tokenData?.lastSync);

        // 🔹 Só valida uma vez por dia no servidor
        if (today?.getTime() > lastSync?.getTime()) handleSync();
      }, 60_000 * 5);
    }

    return () => {
      clearInterval(heartbeat);
    };
  }, [tokenData]);

  if (!tokenData?.id) return <Loading />;

  console.log("catraca", catraca);
  return (
    <RevalidateTokenContext.Provider
      value={{
        data: tokenData,
        setTokenData,
        catraca,
        syncing: sync,
        handleSync,
      }}
    >
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
