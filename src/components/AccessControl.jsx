import React, { useEffect, useState } from "react";
import { Label } from "components/ui/Label";
import { Title } from "components/ui/Title";
import { format } from "date-fns";
import {
  login,
  createUsers,
  destroyUsers,
  addFace,
  getConfiguration,
  activatePush,
  getGroups,
  getUserAccessRules,
  createAccessRules,
  getUserGroups,
  createUserGroups,
  getAccessRules,
  createGroupAccessRules,
} from "services/controlId/idBlockNext";
import { toast } from "react-toastify";
import { useSocketLocal } from "contexts/SocketLocal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHistoricLastAccess } from "services/historic";

export default function AccessControl() {
  const { socketLocal } = useSocketLocal();
  const queryClient = useQueryClient();

  // Busca inicial do histórico
  const { data: historic, isLoading } = useQuery({
    queryKey: ["historicLastAccess"],
    queryFn: fetchHistoricLastAccess,
    initialData: {}, // opcional, começa vazio
  });

  // Atualizações em tempo real pelo socket
  useEffect(() => {
    const handleAccess = (newAccess) => {
      console.log("📥 Atualizando histórico via socket...", newAccess);
      if (newAccess) {
        queryClient.setQueryData(["historicLastAccess"], () => {
          return newAccess;
        });
      }
    };

    socketLocal.on("access", handleAccess);
    return () => socketLocal.off("access", handleAccess);
  }, [socketLocal, queryClient]);

  // useEffect(() => {
  //   const ip = "192.168.18.116";
  //   const username = "tsitech";
  //   const password = "admin";
  //   const load = async () => {
  //     const userId = 10;
  //     console.log("KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK");
  //     const data = await login(ip, { login: username, password });
  //     const { session } = data || {};

  //     if (!session) {
  //       toast.error(
  //         "Não foi possível se comunicar com a catraca. Por favor, verifique os dados."
  //       );
  //       return;
  //     }
  //     // await destroyUsers(ip, session)

  //     const user = await createUsers(ip, session, [
  //       {
  //         name: "Douglas Miguel",
  //         id: userId,
  //         registration: "",
  //       },
  //     ]);

  //     // //   console.log('Usuário criado:', user);
  //     const res = await addFace(ip, session, userId, base64Image);
  //     console.log("IMAGE", res);

  //     // const push = await activatePush(ip, session);
  //     // console.log("activatePush", push)

  //     // const configurations = await getConfiguration(ip, session);
  //     // console.log("getConfiguration", configurations)

  //     // const groups = await getGroups(ip, session);
  //     // console.log("getGroups", groups)

  //     // const userAccessRules = await getUserAccessRules(ip, session);
  //     // console.log("getUserAccessRules", userAccessRules)

  //     // const userGroups = await getUserGroups(ip, session);
  //     // console.log("getUserGroups", userGroups)

  //     // const accessRules = await getAccessRules(ip, session);
  //     // console.log("getAccessRules", accessRules)

  //     // const userGroups = await createUserGroups(ip, session, [{user_id: userId, group_id: 1}]);
  //     // console.log("createUserGroups", userGroups)

  //     // createAccessRules, createGroupAccessRules
  //   };

  //   load();
  // }, []);

  if (isLoading || !historic)
    return (
      <div className="w-full min-h-[316px] lg:min-h-[260px] flex justify-center items-center">
        <Title className="">Aguardando novos acessos na Catraca...</Title>
      </div>
    );

  return (
    <>
      <div className="text-center">
        <Title className="text-xl">Último acesso na Catraca</Title>
      </div>
      <div className="w-full flex flex-wrap gap-3 mt-8">
        <div>
          <img
            src={historic?.enrollment?.picture || "/logo.png"}
            alt="Logo da TSI Gym"
            className="w-[120px] h-[120px] rounded-md border-2 border-primary"
          />
        </div>
        {historic?.type === "terminal" ? (
          <div className="flex flex-col gap-0">
            <div>
              <Label className="font-semibold text-[16px]">Matrícula:</Label>{" "}
              <span>
                {historic?.enrollment?.code?.toString()?.padStart(6, "0") ||
                  "000000"}
              </span>
            </div>
            <div>
              <Label className="font-semibold text-[16px]">
                Nome do usuário:
              </Label>{" "}
              <span>
                {historic?.enrollment?.name || "Usuário não identificado"}
              </span>
            </div>
            <div>
              <Label className="font-semibold text-[16px]">
                Dt. Nascimento:
              </Label>{" "}
              <span>{historic?.enrollment?.birthdate || "N/A"}</span>
            </div>
            <div>
              <Label className="font-semibold text-[16px]">Endereço:</Label>{" "}
              <span>
                {historic?.enrollment?.addressZipcode
                  ? [
                      historic?.enrollment?.addressStreet,
                      historic?.enrollment?.addressNumber,
                      historic?.enrollment?.addressNeighborhood,
                      historic?.enrollment?.addressCity,
                      historic?.enrollment?.addressState,
                      historic?.enrollment?.addressZipcode,
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
              <Label className="font-semibold text-[16px]">Ação manual</Label>{" "}
            </div>
            <div>
              <Label className="font-semibold text-[16px]">Motivo:</Label>{" "}
              <span>{historic?.message}</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-4 w-full items-center gap-2">
        <Label className="font-semibold text-[16px]">Horário do acesso:</Label>{" "}
        <span>
          {historic?.attendedAt
            ? format(historic?.attendedAt, "dd/MM/yyyy HH:mm:ss")
            : "-"}
        </span>
        <Label
          className={`text-xl font-bold border-none rounded-[5px] px-3 py-2 text-white ${
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
    </>
  );
}
