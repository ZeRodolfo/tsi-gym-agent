import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkToken } from "../services/settings";

export default function SetupPage() {
  const [clientToken, setClientToken] = useState("sample-client-token");
  const [clientSecretToken, setClientSecretToken] = useState("sample-secret-token");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSaveToken = (token) => {
    window.api.saveTokenData({ token, info: "dados da empresa no servidor" });
  };

  useEffect(() => {
    const checkToken = async () => {
      const data = await window.api?.getTokenData?.();
      if (data?.id) {
        console.log("Token já existe:", data);
      }

      navigate("/parameters");
    };

    checkToken();
  }, []);

  const validateToken = async () => {
    try {
      const data = await checkToken(clientToken, clientSecretToken);

      if (data.id) {
        handleSaveToken(data); // chama o Electron (via preload) para salvar localmente
        navigate("/parameters");
      } else {
        setError("Token inválido.");
      }
    } catch {
      setError("Erro ao validar o token.");
    }
  };

  return (
    <div>
      <h2>Configuração do Token</h2>
      <input
        value={clientToken}
        onChange={(e) => setClientToken(e.target.value)}
        placeholder="Digite o client token"
      />
      <input
        value={clientSecretToken}
        onChange={(e) => setClientSecretToken(e.target.value)}
        placeholder="Digite o client secret token"
      />
      <button onClick={validateToken}>Validar e Continuar</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
