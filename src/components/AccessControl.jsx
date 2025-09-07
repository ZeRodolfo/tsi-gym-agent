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

export default function AccessControl() {
  const { socketLocal } = useSocketLocal();
  const [user, setUser] = useState({});

  useEffect(() => {
    if (socketLocal) {
      socketLocal.on("access", (data) => {
        console.log("📥 Status do acesso a catraca:", data);
        // usar o zustand?
        setUser(data);
      });
    }
  }, [socketLocal]);
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

  return (
    <>
      {user?.enrollment?.id ? (
        <>
          <div className="text-center">
            <Title className="text-xl">Último acesso na Catraca</Title>
          </div>
          <div className="w-full flex flex-wrap gap-3 mt-8">
            <div>
              <img
                src={user?.enrollment?.picture || "/logo.png"}
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
                <span>
                  {user?.enrollment?.name || "Usuário não identificado"}
                </span>
              </div>
              <div>
                <Label className="font-semibold text-[16px]">
                  Dt. Nascimento:
                </Label>{" "}
                <span>{user?.enrollment?.birthdate || "N/A"}</span>
              </div>
              <div>
                <Label className="font-semibold text-[16px]">Endereço:</Label>{" "}
                <span>
                  {user?.enrollment?.address
                    ? [
                        user?.enrollment?.address?.street,
                        user?.enrollment?.address?.number,
                        user?.enrollment?.address?.city,
                        user?.enrollment?.address?.state,
                        user?.enrollment?.address?.zip,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4 w-full items-center gap-2">
            <Label className="font-semibold text-[16px]">
              Horário do acesso:
            </Label>{" "}
            <span> {format(new Date(), "dd/MM/yyyy HH:mm:ss")}</span>
            <Label
              className={`text-xl font-bold border-none rounded-[5px] px-3 py-2 text-white ${
                user?.event === 7 ? "bg-success" : "bg-primary"
              }`}
            >
              {user?.event === 7
                ? "LIBERADO"
                : `NEGADO: ${user?.message || "Matrícula vencida"}`}
            </Label>
          </div>
        </>
      ) : (
        <div className="w-full min-h-[316px] lg:min-h-[260px] flex justify-center items-center">
          <Title className="">Aguardando novos acessos na Catraca...</Title>
        </div>
      )}
    </>
  );
}
