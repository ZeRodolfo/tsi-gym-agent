import React, { useState } from "react";
import { format } from "date-fns";
import { FaSyncAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { checkToken } from "services/settings";

export default function CompanyHeader({ token, lastCheck, onChangeToken }) {
  const [sync, setSync] = useState(false);

  const handleSync = async () => {
    setSync(true);

    try {
      const data = await checkToken(token.clientToken, token.clientSecretToken);

      if (data?.id) {
        const payload = {
          token: data,
          info: "dados da empresa no servidor",
          lastCheck: new Date().toISOString(),
        };

        window.api.saveTokenData(payload);
        onChangeToken(payload);
        toast.success("Sincronização realizada com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao sincronizar. Por favor, tente novamente.");

      window.api.saveTokenData(null);
      onChangeToken(null);
    } finally {
      setSync(false);
    }
  };

  return (
    <div>
      <header className="mb-0 bg-primary text-white">
        <div className="flex justify-between w-full px-3 py-2">
          <span>{token?.company?.name}</span>
          <div className="flex flex-wrap gap-2 justify-end items-center">
            <p>
              Última sincronização:{" "}
              {format(new Date(lastCheck), "dd/MM/yyyy HH:mm:ss")}
            </p>
            <b>|</b>
            <button
              className="flex gap-2 items-center"
              onClick={handleSync}
              disabled={sync}
            >
              <FaSyncAlt size={14} className={sync ? "animate-spin" : ""} />
              {sync ? "sincronizando..." : "sincronizar"}
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
