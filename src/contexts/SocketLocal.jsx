import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "services/api";
import { io } from "socket.io-client";

const SocketLocalContext = createContext(null);

export const SocketLocalProvider = ({ children }) => {
  const [socketLocal, setSocketLocal] = useState(null);

  const initSocket = async (data) => {
    const socket = io("http://localhost:4000");

    socket.on("connect", () => {
      console.log("🔗 Conectado ao servidor Local:", socket.id);
    });

    setSocketLocal(socket);

    socket.on("disconnect", () => {
      console.log("⚠️ Desconectado do servidor Local");
    });

    // socket.on("access", (data) => {
    //   console.log("📥 Status do acesso a catraca:", data);
    //   // usar o zustand?
    // });
  };

  useEffect(() => {
    const bootstrap = async () => {
      const { data } = await api.get("/catracas/current");
      if (data?.id) initSocket(data);
    };
    bootstrap();
  }, []);

  return (
    <SocketLocalContext.Provider value={{ socketLocal }}>
      {children}
    </SocketLocalContext.Provider>
  );
};

export const useSocketLocal = () => {
  const context = useContext(SocketLocalContext);
  if (!context) {
    throw new Error(
      "useSocketLocal deve ser usado dentro de um SocketLocalProvider"
    );
  }
  return context;
};
