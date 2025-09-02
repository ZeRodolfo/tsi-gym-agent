import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { validateTokens } from "../services/catracas";
import { Label } from "components/ui/Label";
import { Input } from "components/ui/Input";
import { Button } from "components/ui/Button";
import { toast } from "react-toastify";

export default function SetupPage() {
  const [clientId, setClientId] = useState("901a1b77-787d-4bba-883c-d5656a8dfd39-APP");
  const [clientSecret, setClientSecret] = useState("a48e4310-94b2-494e-8135-8a94a0f1b78c-APP");
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
      // await window.api?.logoutCatracaData();
      const data = await window.api?.getTokenData?.();
      if (data?.token?.id) console.log("Token já existe:", data);
      navigate("/parameters");
    };

    checkToken();
  }, []);

  const validateToken = async () => {
    try {
      const data = await validateTokens(clientId, clientSecret);

      if (data.id) {
        handleSaveToken(data); // chama o Electron (via preload) para salvar localmente
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
            src="/logo.png"
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
