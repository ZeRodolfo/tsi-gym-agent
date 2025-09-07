import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "services/api";
import { io } from "socket.io-client";
// import { toast } from "sonner";
import {
  login,
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

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  // 🔹 Inicia socket de comunicação
  const initSocket = async (data) => {
    const machineId = await window.system.getMachineId();
    const socket = io("http://localhost:4003/agent", {
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
      heartbeat = setInterval(() => {
        socket.emit("ping", {
          timestamp: new Date().toISOString(),
        });
      }, 30000);
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
        image: Json.stringify(image),
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
    bootstrap();
  }, []);

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
