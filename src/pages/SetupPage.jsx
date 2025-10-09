import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "components/ui/Label";
import { Input } from "components/ui/Input";
import { Button } from "components/ui/Button";
import { toast } from "react-toastify";
import axios from "axios";
import { getCatraca, checkTokens } from "services/catracas";
import { getSettings } from "services/settings";
import logo from "assets/logo.png"; // Caminho relativo a partir do seu componente

const api = axios.create({
  baseURL: process.env.REACT_APP_API_LOCAL_URL,
});

export default function SetupPage() {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const navigate = useNavigate();

  const handleSaveToken = (data) => {
    window.api.saveTokenData({
      ...data,
      tokens: { clientId, clientSecret },
      info: "Dados da empresa no servidor",
    });
  };

  useEffect(() => {
    const checkToken = async () => {
      const { data: catraca } = await getCatraca();
      const { data: settings } = await getSettings();

      if (!settings?.id && !settings?.ip && catraca?.id)
        return navigate("/parameters");
      else if (catraca?.id && settings?.id && settings?.ip)
        return navigate("/main");
    };

    checkToken();
  }, []);

  const validateToken = async () => {
    try {
      const machineKey = await window.system.getMachineId();
      const { data } = await checkTokens({
        clientId,
        clientSecret,
        machineKey,
        machineName: "PC Name",
      });

      if (data?.id) {
        navigate("/parameters");
      } else {
        toast.error("Credenciais inválidas. Por favor, tente novamente.");
      }
    } catch (err) {
      console.log(err);
      toast.error("Credenciais inválidas. Por favor, tente novamente.");
    }
  };

  return (
    <main>
      <div className="px-3 flex flex-col gap-2 justify-center items-center w-full">
        <div>
          <img
            src={logo}
            alt="Logo da TSI Gym"
            className="w-[180px] h-[180px] rounded-full"
          />
        </div>
        <h2 className="font-bold text-xl">
          Bem-vindo ao Configurador de Catraca
        </h2>

        <div className="mt-3 max-w-[350px] w-full flex flex-col gap-3">
          <div>
            <Label>Client ID</Label>

            <Input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Digite o client id"
              className="flex-1"
            />
          </div>
          <div>
            <Label>Client Secret</Label>

            <Input
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Digite o client secret"
            />
          </div>
          <div className="w-full text-center">
            <Button onClick={validateToken} className="max-w-[200px]">
              Validar e Continuar
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
