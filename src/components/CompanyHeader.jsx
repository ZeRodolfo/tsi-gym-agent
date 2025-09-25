import React, { useState } from "react";
import { format } from "date-fns";
import { FaSyncAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { checkTokens } from "services/catracas";
import { fetchSync, sendSyncHistoricAccess } from "services/sync";
import { useRevalidateToken } from "contexts/RevalidateToken";

export default function CompanyHeader({ name, companyName, lastSync }) {
  const { syncing, handleSync } = useRevalidateToken();

  return (
    <div>
      <header className="mb-0 bg-primary text-white">
        <div className="flex justify-between w-full px-3 py-2">
          <span>{companyName || name}</span>
          <div className="flex flex-wrap gap-2 justify-end items-center">
            <p>
              Última sincronização:{" "}
              {lastSync
                ? format(new Date(lastSync), "dd/MM/yyyy HH:mm:ss")
                : "-"}
            </p>
            <b>|</b>
            <button
              className="flex gap-2 items-center"
              onClick={() => handleSync()}
              disabled={syncing}
            >
              <FaSyncAlt size={14} className={syncing ? "animate-spin" : ""} />
              {syncing ? "sincronizando..." : "sincronizar"}
            </button>
            {/* <button
              className="flex gap-2 items-center"
              onClick={handleReset}
              disabled={sync}
            >
              <FaSyncAlt size={14} className={sync ? "animate-spin" : ""} />
              Sair
            </button> */}
          </div>
        </div>
      </header>
    </div>
  );
}
