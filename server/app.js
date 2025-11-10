require("reflect-metadata");
require("dotenv").config();

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env.BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:4003"
    : "https://gym-api.tsitech.com.br";

const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const logger = require("./utils/logger"); // Importe o logger configurado

const { AppDataSource } = require("./ormconfig");
const jobs = require("./jobs");
const routers = require("./routes");
const socketInit = require("./socket");

// let logDirectory;

// if (process.env.NODE_ENV === "development") {
//   // No modo de desenvolvimento, use a pasta raiz do projeto.
//   // path.resolve() é seguro e obtém um caminho absoluto.
//   logDirectory = path.resolve(__dirname, "../../logs");
// } else {
//   // No modo de produção (após o build), use process.resourcesPath.
//   logDirectory = path.join(process.resourcesPath, "logs");
// }

// Crie um stream de escrita para o arquivo de log
// const accessLogStream = fs.createWriteStream(
//   path.join(logDirectory, "access.log"),
//   { flags: "a" }
// );

const PORT = process.env.API_PORT || 4000;

function startServer() {
  logger.info(`HOST do servidor VPS: ${process.env.BASE_URL}`);
  AppDataSource.initialize()
    .then(() => {
      logger.info("Conectado ao SQLite com TypeORM!");
      // socketInit();
    })
    .catch((err) => logger.error("Erro ao conectar no banco de dados:", err));

  jobs();
  const app = express();
  // Configure o Morgan para usar o stream de arquivo
  // app.use(morgan("combined", { stream: accessLogStream }));
  const server = http.createServer(app); // HTTP + Express
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3001"], // se usar React dev server
      // methods: ["GET", "POST"],
    },
  });

  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true, limit: "150mb" })); // URL-encoded primeiro
  app.use(express.json({ limit: "150mb" })); // JSON depois
  app.set("io", io); // 👉 Deixa o `io` acessível nas rotas

  // Eventos Socket.io
  io.on("connection", (socket) => {
    logger.info("Socket local conectado:", socket.id);

    // Cliente local pede status
    // socket.on("getStatus", () => {
    //   socket.emit("catraca:status", { online: true });
    // });

    // Desconexão
    socket.on("disconnect", () => {
      logger.info("Socket local desconectado:", socket.id);
    });
  });

  // app.all('*', (req, res, next) => {
  //   logger.info(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  //   logger.info('Headers:', req.headers);
  //   logger.info('Body:', req.body);
  //   next();
  // });

  app.use((req, res, next) => {
    // faz uma cópia superficial do body (para log)
    const bodyForLog = JSON.parse(JSON.stringify(req.body || {}));

    // remove apenas no log, sem afetar o original
    if (bodyForLog?.picture) delete bodyForLog.picture;
    if (bodyForLog?.person?.picture) delete bodyForLog.person.picture;
    if (bodyForLog?.student?.person?.picture)
      delete bodyForLog.student.person.picture;
    if (bodyForLog?.employee?.person?.picture)
      delete bodyForLog.employee.person.picture;
    if (bodyForLog?.teacher?.person?.picture)
      delete bodyForLog.teacher.person.picture;
    if (bodyForLog?.supplier?.person?.picture)
      delete bodyForLog.supplier.person.picture;

    logger.info("Rota", {
      method: req.method,
      originalUrl: req.originalUrl,
      body: bodyForLog,
    });

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
    logger.info("Tentativa de verificação de sessão:", { session });
    return res.status(200).json({});
  });
  app.post(["/session_is_valid.fcgi", "/device_is_alive.fcgi"], (req, res) => {
    const { session } = req.body;
    logger.info("Tentativa de verificação de sessão:", { session });
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
    logger.info("Tentativa de verificação de sessão:", { session });
    return res.status(200).json({});
  });

  server.listen(PORT, () => {
    logger.info(`Servidor de acesso iniciado na porta ${PORT}`);
  });
}

module.exports = { startServer };
