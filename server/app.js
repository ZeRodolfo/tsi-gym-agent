require("reflect-metadata");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");

const { AppDataSource } = require("./ormconfig");
const jobs = require("./jobs");
const routers = require("./routes");

function startServer() {
  AppDataSource.initialize()
    .then(() => {
      console.log("Conectado ao SQLite com TypeORM!");
    })
    .catch((err) => console.error("Erro ao conectar no banco de dados:", err));

  jobs();
  const app = express();
  const server = http.createServer(app); // HTTP + Express
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3001"], // se usar React dev server
      // methods: ["GET", "POST"],
    },
  });

  app.use(express.json({ limit: "10mb" }));
  app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cors()); // Libera tudo (para dev)
  app.set("io", io); // 👉 Deixa o `io` acessível nas rotas

  // Eventos Socket.io
  io.on("connection", (socket) => {
    console.log("Servidor local conectado:", socket.id);

    // Cliente local pede status
    // socket.on("getStatus", () => {
    //   socket.emit("catraca:status", { online: true });
    // });

    // Desconexão
    socket.on("disconnect", () => {
      console.log("Servidor local desconectado:", socket.id);
    });
  });

  // app.all('*', (req, res, next) => {
  //   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  //   console.log('Headers:', req.headers);
  //   console.log('Body:', req.body);
  //   next();
  // });

  app.use((req, res, next) => {
    console.log(Date.now(), req.method, req.originalUrl, req.body);
    next();
  });
  // Endpoint de saúde: a catraca fará GET aqui para verificar disponibilidade
  // app.get(['/session_is_valid.fcgi', '/device_is_alive.fcgi'], (req, res) => {
  //   res.sendStatus(200);
  // });

  app.use("/api", routers); // Usa as rotas definidas

  // verificar se esta sendo usado essas rotas abaixo
  app.get(["/session_is_valid.fcgi", "/device_is_alive.fcgi"], (req, res) => {
    const { session } = req.body;
    console.log("Tentativa de verificação de sessão:", { session });
    return res.status(200).json({});
  });
  app.post(["/session_is_valid.fcgi", "/device_is_alive.fcgi"], (req, res) => {
    const { session } = req.body;
    console.log("Tentativa de verificação de sessão:", { session });
    return res.status(200).json({});
  });

  app.post("/new_user_identified.fcgi", async (req, res) => {
    const {
      user_id: userIdStr,
      event: eventStr,
      user_name: userName,
      portal_id: portalIdStr,
    } = req.body;

    const userId = parseInt(userIdStr, 10);
    const event = parseInt(eventStr, 10);
    const portalId = parseInt(portalIdStr, 10);

    // Identificação falhou? event != 1
    if (event !== 1 || !userId) {
      return res.json({ result: { event: 6, portal_id: portalId } });
    }

    // Buscar usuário no seu sistema
    const user = null; // await getUserById(userId);
    if (!user) {
      return res.json({
        result: {
          event: 6,
          user_id: userId,
          portal_id: portalId,
          message: "Usuário não cadastrado",
        },
      });
    }

    // Verificar status financeiro
    if (!user.paymentOk) {
      return res.json({
        result: {
          event: 6,
          user_id: userId,
          portal_id: portalId,
          message: "Mensalidade em atraso",
        },
      });
    }

    // Se atingiu aqui, libera o acesso
    return res.json({
      result: {
        event: 7,
        user_id: userId,
        portal_id: portalId,
        actions: [{ action: "catra", parameters: "allow=clockwise" }],
        message: `Bem-vindo, ${userName || user.name}!`,
      },
    });
  });

  app.post("/session_is_valid.fcgi", (req, res) => {
    const { session } = req.body;
    console.log("Tentativa de verificação de sessão:", { session });
    return res.status(200).json({});
  });

  server.listen(4000, () => {
    console.log("Servidor de acesso iniciado na porta 4000");
  });
}

module.exports = { startServer };
