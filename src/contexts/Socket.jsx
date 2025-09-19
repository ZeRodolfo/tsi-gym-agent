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
  const [session, setSession] = useState(null);
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    initialData: null, // opcional, começa vazio
  });

  useEffect(() => {
    const load = async () => {
      try {
        const ip = settings?.ip;
        const username = settings?.username;
        const password = settings?.password;
        const { data: response } = await login(ip, {
          login: username,
          password,
        });
        setSession(response?.session);
      } catch (err) {
        console.log("Não foi possível recuperar a seção");
        setSession(null);
      }
    };

    if (settings) load();
  }, [settings]);

  // 🔹 Inicia socket de comunicação
  const initSocket = async (data) => {
    const machineId = await window.system.getMachineId();
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

    let heartbeat;

    socket.on("connect", () => {
      console.log("🔗 Conectado ao servidor VPS:", socket.id);

      // envia heartbeat a cada 30s
      heartbeat = setInterval(async () => {
        // const get ping local
        try {
          const config = await verifySession(settings?.ip, session);
          if (config)
            socket.emit("catraca_status", {
              timestamp: new Date().toISOString(),
              online: true,
            });
        } catch (err) {
          console.log("Offline");
          socket.emit("catraca_status", {
            timestamp: new Date().toISOString(),
            online: false,
          });
        }
      }, 20000);
    });

    setSocket(socket);

    socket.on("disconnect", () => {
      console.log("⚠️ Desconectado do servidor VPS");
      clearInterval(heartbeat);
    });

    socket.on("insert-enrollment", (enrollment) => {
      console.log("📥 Novo usuário para criar na catraca:", enrollment);
      createUserInCatraca(enrollment);
    });

    socket.on("enrollment:payment", (enrollment) => {
      console.log(
        "📥 Matricula paga para atualizar registro na catraca:",
        enrollment
      );
      paymentEnrollment(enrollment);
    });

    socket.on("free-catraca", (response) => {
      console.log("liberação da catraca", response);
      handleFreeCatracaConfirm(data, settings, response?.reason);
    });

    socket.on("command", (command) => {
      console.log("📢 Comando recebido:", command);
      if (command.action === "open-gate") {
        // lógica para liberar a catraca
      }
    });
  };

  // 🔹 Cria usuário na catraca local
  const createUserInCatraca = async (enrollment) => {
    console.log("Iniciando criação de usuário na catraca...", enrollment);
    try {
      await api.post("/enrollments", enrollment);
      // const catraca = await window.api?.getCatracaData?.();
      const { data: catraca } = await api.get("/catracas/current");
      const { data: settings } = await api.get("/settings");
      const ip = settings?.ip;
      const username = settings?.username;
      const password = settings?.password;

      const { data: response } = await login(ip, { login: username, password });
      if (!response?.session) throw new Error("Falha ao autenticar na catraca");
      setSession(response?.session);
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
        enrollment?.picture?.replace("data:image/png;base64,", "")
      );

      console.log("✅ Usuário criado com sucesso na catraca", { user, image });
      // opcional: enviar confirmação ao servidor via socket
      // não reconheceu o socket, esta undefined
      socket.emit("enrollment-created", {
        enrollmentId: enrollment.id,
        catracaId: catraca.id,
        user: Json.stringify(user),
        picture: Json.stringify(image),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("❌ Erro ao criar usuário na catraca:", err);
      // toast.error("Não foi possível cadastrar usuário na catraca");
    }
  };

  // 🔹 Cria usuário na catraca local
  const paymentEnrollment = async (enrollment) => {
    console.log("Iniciando pagamento da matricula...", enrollment);
    try {
      await api.post("/enrollments", enrollment);
    } catch (err) {
      console.error("❌ Erro ao criar usuário na catraca:", err);
      // toast.error("Não foi possível cadastrar usuário na catraca");
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
