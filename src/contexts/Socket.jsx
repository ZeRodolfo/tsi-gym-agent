import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "services/api";
import { io } from "socket.io-client";
// import { toast } from "sonner";
import {
  login,
  verifySession,
  createUsers,
  createOrUpdateUsers,
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
import { useQuery } from "@tanstack/react-query";
import { fetchSettings } from "services/settings";
import { handleFreeCatracaConfirm } from "utils/freeCatraca";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    initialData: null, // opcional, começa vazio
  });

  let heartbeat;

  useEffect(() => {
    // envia heartbeat a cada 20s
    heartbeat = setInterval(async () => {
      if (!socket || !settings) return null;

      try {
        const ip = settings?.ip;
        const username = settings?.username;
        const password = settings?.password;
        const { data: response } = await login(ip, {
          login: username,
          password,
        });
        if (!response?.session)
          throw new Error("Falha ao autenticar na catraca");

        socket.emit("status", {
          timestamp: new Date().toISOString(),
          agent: {
            online: true,
          },
          machine: {
            online: true,
          },
        });
      } catch (err) {
        socket.emit("status", {
          timestamp: new Date().toISOString(),
          agent: {
            online: true,
          },
          machine: {
            online: false,
          },
        });
      }
    }, 20000);

    return () => {
      clearInterval(heartbeat);
    };
  }, [socket, settings]);

  // 🔹 Inicia socket de comunicação
  const initSocket = async (data) => {
    const machineId = await window.system.getMachineId();
    console.log(`Machine ID: ${machineId}`);
    const socket = io(process.env.REACT_APP_WSS_BASE_URL, {
      query: {
        companyId: data.companyId,
        branchId: data.branchId,
        catracaId: data.id,
        machineId,
        tokens: JSON.stringify({
          clientId: data.clientId,
          clientSecret: data?.clientSecret,
        }),
      },
    });

    socket.on("connect", () => {
      console.log("🔗 Conectado ao servidor VPS:", socket.id);
    });

    setSocket(socket);

    socket.on("disconnect", () => {
      console.log("⚠️ Desconectado do servidor VPS");
      clearInterval(heartbeat);
    });

    socket.on("insert-enrollment", (enrollment) => {
      createUserInCatraca(enrollment);
    });

    socket.on("insert-enrollments", async (enrollments) => {
      console.log(
        "📥 Sincronizando Novos usuários para criar na catraca:",
        enrollments
      );
      for (const enrollment of enrollments) {
        await createUserInCatraca(enrollment);
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve(true);
          }, 1500)
        );
      }
    });

    socket.on("update-enrollments", async (enrollments) => {
      console.log("📥 Atualizando as Matrículas no banco local:", enrollments);
      for (const enrollment of enrollments) {
        await api.put("/enrollments", enrollment);
      }
    });

    socket.on("update-picture", (person) => {
      console.log("📥 Atualizando imagem do usuário na catraca:", person);
      updatePictureByPerson(person);
    });

    socket.on("enrollment:payment", (enrollment) => {
      console.log(
        "📥 Matricula paga para atualizar registro na catraca:",
        enrollment
      );
      paymentEnrollment(enrollment);
    });

    socket.on("catraca_free", (response) => {
      console.log("Iniciando liberação da catraca", response);
      handleFreeCatracaConfirm(data, settings, response?.reason);
    });

    socket.on("command", (command) => {
      console.log("📢 Comando recebido:", command);
      if (command.action === "open-gate") {
        // lógica para liberar a catraca
      }
    });

    socket.on("print:printer", async (response) => {
      console.log("response", response);

      try {
        const { data: printer } = await api.get(
          `/printers/${response?.printerId}`
        );

        console.log("printer", printer);
        // get printer?
        window.printerAPI.print(printer, response?.type, response?.data);
      } catch (err) {
        console.log(err);
      }

      // window.printerAPI
      //   .print("Olá impressora!")
      //   .then((res) => console.log("Impresso com sucesso:", res))
      //   .catch((err) => console.error("Erro ao imprimir:", err));
    });
  };

  // 🔹 Cria usuário na catraca local
  const createUserInCatraca = async (enrollment) => {
    console.log("📥 Novo usuário para criar na catraca:", enrollment);
    try {
      await api.post("/enrollments", { ...enrollment, synced: false });

      if (enrollment?.picture) {
        const { data: catraca } = await api.get("/catracas/current");
        const { data: settings } = await api.get("/settings");
        const ip = settings?.ip;
        const username = settings?.username;
        const password = settings?.password;

        const { data: response } = await login(ip, {
          login: username,
          password,
        });
        if (!response?.session)
          throw new Error("Falha ao autenticar na catraca");
        const user = await createOrUpdateUsers(ip, response?.session, [
          {
            id: enrollment?.identifierCatraca, // persiste o ID da matrícula na catraca como identificador
            name: enrollment?.student?.name,
            registration: "",
          },
        ]);

        const image = await addFace(
          ip,
          response?.session,
          enrollment?.identifierCatraca,
          enrollment?.picture
            ?.replace("data:image/png;base64,", "")
            ?.replace("data:image/jpeg;base64,", "")
        );

        console.log("✅ Usuário criado com sucesso na catraca");
        await api.post("/enrollments", { ...enrollment, synced: true });

        // opcional: enviar confirmação ao servidor via socket
        // não reconheceu o socket, esta undefined
        // socket.emit("enrollment-created", {
        //   enrollmentId: enrollment.id,
        //   catracaId: catraca.id,
        //   user: Json.stringify(user),
        //   picture: Json.stringify(image),
        //   timestamp: new Date().toISOString(),
        // });
      }
    } catch (err) {
      console.error("❌ Erro ao criar usuário na catraca:", err);
      // toast.error("Não foi possível cadastrar usuário na catraca");
    }
  };

  // 🔹 Cria usuário na catraca local
  const paymentEnrollment = async (enrollment) => {
    // console.log("Iniciando pagamento da matricula...", enrollment);
    try {
      await api.post("/enrollments", enrollment);
    } catch (err) {
      console.error("❌ Erro ao criar usuário na catraca:", err);
      // toast.error("Não foi possível cadastrar usuário na catraca");
    }
  };

  const updatePictureByPerson = async (person) => {
    try {
      const enrollments = await api.patch(
        "/enrollments/update-picture",
        person
      );
      if (!enrollments?.length) {
        console.log("Usuário não encontrado na catraca...");
        return;
      }

      const enrollment = enrollments[0];
      const { data: settings } = await api.get("/settings");
      const ip = settings?.ip;
      const username = settings?.username;
      const password = settings?.password;

      const { data: response } = await login(ip, { login: username, password });
      if (!response?.session) throw new Error("Falha ao autenticar na catraca");

      // verificar se será necessário criar um u
      await createOrUpdateUsers(ip, response?.session, [
        {
          id: person?.identifierCatraca, // persiste o ID da matrícula na catraca como identificador
          name: person?.name || enrollment?.name || enrollment?.studentName,
          registration: "",
        },
      ]);
      await addFace(
        ip,
        response?.session,
        person?.identifierCatraca,
        person?.picture
          ?.replace("data:image/png;base64,", "")
          ?.replace("data:image/jpeg;base64,", "")
      );

      console.log("✅ Foto do usuário atualizada com sucesso na catraca");
    } catch (err) {
      console.error("❌ Erro ao atualizar a foto do usuário na catraca:", err);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      const { data } = await api.get("/catracas/current");
      // const data = await window.api.getTokenData();
      if (data?.id) {
        initSocket(data);
      }
    };
    if (settings) bootstrap();
  }, [settings]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket deve ser usado dentro de um SocketProvider");
  }
  return context;
};
