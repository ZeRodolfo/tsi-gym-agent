import React, { useEffect } from "react";
import { Label } from "components/ui/Label";
import { Title } from "components/ui/Title";
import { format } from "date-fns";
import { useSocketLocal } from "contexts/SocketLocal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHistoric } from "services/historic";
import logo from "assets/logo.png"; // Caminho relativo a partir do seu componente

export default function HistoricAccess() {
  const { socketLocal } = useSocketLocal();
  const queryClient = useQueryClient();

  // Busca inicial do histórico
  const { data: historics, isLoading } = useQuery({
    queryKey: ["historicAccess"],
    queryFn: fetchHistoric,
    initialData: [], // opcional, começa vazio
  });

  // Atualizações em tempo real pelo socket
  useEffect(() => {
    if (!socketLocal) return;

    const handleAccess = (newAccess) => {
      console.log("📥 Atualizando histórico via socket...", newAccess);

      if (newAccess) {
        // adiciona novo item no topo
        queryClient.setQueryData(["historicAccess"], (old = []) => {
          return [newAccess, ...old].slice(0, 25); // limite opcional de 25
        });
      }
    };

    socketLocal.on("access", handleAccess);
    return () => socketLocal.off("access", handleAccess);
  }, [socketLocal, queryClient]);

  if (isLoading || !historics?.length)
    return (
      <div className="w-full min-h-[316px] lg:min-h-[260px] flex justify-center items-center">
        <Title className="">Aguardando novos acessos na Catraca...</Title>
      </div>
    );

  return (
    <section className="px-3">
      <div className="text-center">
        <Title className="text-xl">Histórico de acessos na Catraca</Title>
      </div>
      {historics?.map((historic, index) => {
        const item =
          historic?.enrollment || historic?.teacher || historic?.employee;
        return (
          <div className="w-full flex flex-col gap-2" key={index}>
            <div className="w-full flex flex-wrap gap-3 mt-8">
              <div>
                <img
                  src={item?.picture || logo}
                  alt="Logo da TSI Gym"
                  className="w-[120px] h-[120px] rounded-md border-2 border-primary"
                />
              </div>
              {historic?.type === "terminal" ? (
                <div className="flex flex-col gap-0">
                  {historic?.enrollment && (
                    <div>
                      <Label className="font-semibold text-[16px]">
                        Matrícula:
                      </Label>{" "}
                      <span>
                        {item?.code?.toString()?.padStart(6, "0") || "000000"}
                      </span>
                    </div>
                  )}
                  <div>
                    <Label className="font-semibold text-[16px]">
                      Nome do usuário:
                    </Label>{" "}
                    <span>{item?.name || "Usuário não identificado"}</span>
                  </div>
                  <div>
                    <Label className="font-semibold text-[16px]">
                      Dt. Nascimento:
                    </Label>{" "}
                    <span>{item?.birthdate || "N/A"}</span>
                  </div>
                  <div>
                    <Label className="font-semibold text-[16px]">
                      Endereço:
                    </Label>{" "}
                    <span>
                      {item?.addressZipcode
                        ? [
                            item?.addressStreet,
                            item?.addressNumber,
                            item?.addressNeighborhood,
                            item?.addressCity,
                            item?.addressState,
                            item?.addressZipcode,
                          ]
                            .filter(Boolean)
                            .join(", ")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-0">
                  <div>
                    <Label className="font-semibold text-[16px]">
                      Ação manual
                    </Label>{" "}
                  </div>
                  <div>
                    <Label className="font-semibold text-[16px]">Motivo:</Label>{" "}
                    <span>{historic?.message}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-start md:justify-end mt-0 w-full items-center gap-2">
              <Label className="font-semibold text-sm">
                Horário do acesso:
              </Label>{" "}
              <span>
                {historic?.attendedAt
                  ? format(historic?.attendedAt, "dd/MM/yyyy HH:mm:ss")
                  : "-"}
              </span>
              <Label
                className={`text-sm font-bold border-none rounded-[5px] px-2 py-1 text-white ${
                  historic?.status === "success" ? "bg-success" : "bg-primary"
                }`}
              >
                {historic?.status === "success"
                  ? "LIBERADO"
                  : historic?.type === "terminal"
                  ? `NEGADO: ${historic?.message || "Matrícula vencida"}`
                  : "NEGADO"}
              </Label>
            </div>
          </div>
        );
      })}
    </section>
  );
}
