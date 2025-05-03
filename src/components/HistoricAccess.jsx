import React, { useEffect, useState } from "react";
import { Label } from "components/ui/Label";
import { Title } from "components/ui/Title";
import { format } from "date-fns";

export default function HistoricAccess() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await window.api.getHistoricUserAccessData();
      if (data) setUsers(data || []);
    };

    load();
  }, []);

  if (!users?.length)
    return (
      <div className="w-full min-h-[316px] lg:min-h-[260px] flex justify-center items-center">
        <Title className="">Aguardando novos acessos na Catraca...</Title>
      </div>
    );

  return (
    <>
      <div className="text-center">
        <Title className="text-xl">Histórico de acessos na Catraca</Title>
      </div>
      {users?.map((user, index) => (
        <div className="w-full flex flex-col gap-2" key={index}>
          <div className="w-full flex flex-wrap gap-3 mt-8">
            <div>
              <img
                src="/logo.png"
                alt="Logo da TSI Gym"
                className="w-[120px] h-[120px] rounded-md border-2 border-primary"
              />
            </div>
            <div className="flex flex-col gap-0">
              <div>
                <Label className="font-semibold text-[16px]">Matrícula:</Label>{" "}
                <span>
                  {user?.enrollment?.code?.toString()?.padStart(6, "0") ||
                    "000000"}
                </span>
              </div>
              <div>
                <Label className="font-semibold text-[16px]">
                  Nome do usuário:
                </Label>{" "}
                <span>{user?.name || "Usuário não identificado"}</span>
              </div>
              <div>
                <Label className="font-semibold text-[16px]">
                  Dt. Nascimento:
                </Label>{" "}
                <span>{user?.birthdate || "N/A"}</span>
              </div>
              <div>
                <Label className="font-semibold text-[16px]">Endereço:</Label>{" "}
                <span>
                  {user?.address
                    ? [
                        user.address.street,
                        user.address.number,
                        user.address.city,
                        user.address.state,
                        user.address.zip,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-start md:justify-end mt-0 w-full items-center gap-2">
            <Label className="font-semibold text-sm">Horário do acesso:</Label>{" "}
            <span> {format(new Date(), "dd/MM/yyyy HH:mm:ss")}</span>
            <Label
              className={`text-sm font-bold border-none rounded-[5px] px-2 py-1 text-white ${
                user?.access?.status === "ok" ? "bg-success" : "bg-primary"
              }`}
            >
              {user?.access?.status === "ok"
                ? "LIBERADO"
                : `NEGADO: ${user?.access?.message || "Matrícula vencida"}`}
            </Label>
          </div>
        </div>
      ))}
    </>
  );
}
