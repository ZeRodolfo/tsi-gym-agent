import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import CompanyHeader from "components/CompanyHeader";
import { getCatraca, checkTokens } from "services/catracas";
import { getSettings } from "services/settings";
import Loading from "components/ui/Loading";
import { toast } from "react-toastify";
import { startOfDay } from "date-fns";
import { fetchSync, sendSyncHistoricAccess } from "services/sync";

const RevalidateTokenContext = createContext(null);

export const RevalidateTokenProvider = ({ children }) => {
  const [tokenData, setTokenData] = useState(null);
  const [settingsData, setSettingsData] = useState(null);
  const navigate = useNavigate();
  const [sync, setSync] = useState(false);

  const handleSync = useCallback(
    async (content = null) => {
      setSync(true);

      try {
        let canSync = !!content?.id;
        if (!content) {
          const machineKey = await window.system.getMachineId();
          const { data } = await checkTokens({
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
    const { data: catraca } = await getCatraca();
    const { data: settings } = await getSettings();

    if (!catraca?.id) {
      navigate("/setup");
      return null;
    }
    setTokenData(catraca);

    if (!settings?.id && !settings?.ip) {
      navigate("/parameters");
      return null;
    }

    setSettingsData(settings);
    const machineKey = await window.system.getMachineId();
    const today = startOfDay(new Date());
    const lastSync = startOfDay(catraca?.lastSync);

    // 🔹 Só valida uma vez por dia no servidor
    if (today?.getTime() > lastSync?.getTime()) {
      try {
        const { data: validated } = await checkTokens({
          clientId: catraca.clientId,
          clientSecret: catraca.clientSecret,
          machineKey,
          machineName: "PC Name",
        });

        if (!validated?.id) {
          navigate("/setup");
          return null;
        }

        handleSync(validated);
        return catraca;
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

  return (
    <RevalidateTokenContext.Provider
      value={{
        data: tokenData,
        settings: settingsData,
        setTokenData,
        setSettings: setSettingsData,
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
