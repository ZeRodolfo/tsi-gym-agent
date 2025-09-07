const { io } = require("socket.io-client");
const express = require("express");

const { HOST_WSS } = require("../constants");

const socket = io(HOST_WSS, {
  auth: {
    token: "TOKEN_UNICO_DO_AGENT",
    // pegar o company id
  },
});

// Ao conectar
// socket.on("connect", () => {
//   console.log("Conectado ao servidor VPS:", socket.id);

//   // Envia evento de inicialização
//   socket.emit("agent-event", {
//     agentId: "meu-agent-123",
//     status: "online",
//     timestamp: new Date().toISOString(),
//   });
// });

// Recebendo mensagens do servidor
socket.on("server-response", (data) => {
  console.log("Mensagem do servidor:", data);
});

const router = express.Router();

router.post("/access", (req, res) => {
  socket.emit("event-from-agent", { user: "123", status: "allowed" });
  res.json({ ok: true });
});

module.exports = router;
