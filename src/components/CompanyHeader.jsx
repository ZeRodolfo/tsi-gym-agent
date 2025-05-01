import React, { useState } from "react";
import { format } from "date-fns";

export default function CompanyHeader({ token, lastCheck }) {
  return (
    <div>
      <header className="mb-0 bg-red-800 text-white">
        <div className="flex justify-between w-full px-3 py-2">
          <span>{token?.company?.name}</span>
          <p>
            Última validação:{" "}
            {format(new Date(lastCheck), "dd/MM/yyyy HH:mm:ss")}
          </p>
        </div>
      </header>
    </div>
  );
}
