const { io } = require("socket.io-client");
const { AppDataSource } = require("./ormconfig");
const logger = require("./utils/logger");
const axios = require("axios");

process.env.BASE_URL =
  process.env.REACT_APP_WSS_BASE_URL === "development"
    ? "http://localhost:4003/agent"
    : "https://gym-api.tsitech.com.br/agent";

const api = axios.create({
  baseURL: process.env.BASE_URL,
});

const headerParams = {
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15 segundos
};

module.exports = async () => {
  const repoCatraca = AppDataSource.getRepository("Catraca");
  const catracas = await repoCatraca.find(); // tentar buscar pelo ip da requisição?
  const catraca = catracas?.[0];

  if (catraca) {
    // Conecta ao backend NestJS (ou outro servidor socket)
    const socket = io(process.env.REACT_APP_WSS_BASE_URL, {
      transports: ["websocket"], // força uso do websocket puro
      query: {
        companyId: catraca.companyId,
        branchId: catraca.branchId,
        catracaId: catraca.id,
        machineId: "xpto",
        tokens: JSON.stringify({
          clientId: catraca.clientId,
          clientSecret: catraca?.clientSecret,
        }),
      },
    });

    socket.on("connect", () => {
      logger.info("✅ Conectado ao backend via WebSocket!");
    });

    socket.on("disconnect", () => {
      logger.info("❌ Desconectado do backend");
    });

    socket.on("catraca_free", async (response) => {
      logger.info("Iniciando liberação da catraca", response);

      const {
        data: { session },
      } = await axios.post(
        `http://${catraca?.ip}/login.fcgi`,
        {
          login: catraca?.username,
          password: catraca?.password,
        },
        headerParams
      );
      logger.info("SESSÂO Liberação de Catraca via Socket", { session });
      if (!session)
        logger.error(
          "Falha ao autenticar na catraca para a liberação da catraca via socket"
        );

      await axios.post(
        `http://${catraca?.ip}/user_destroy_image.fcgi?session=${session}`,
        {
          actions: [
            {
              action: "catra",
              parameters:
                catraca?.catraSideToEnter === "0"
                  ? "allow=clockwise"
                  : "allow=anticlockwise",
            },
          ],
        },
        headerParams
      );

      await axios.post(
        `http://${ip}/message_to_screen.fcgi?session=${session}`,
        {
          message: "Catraca Liberada",
          timeout: 7000,
        },
        headerParams
      );

      await api.post("/historic", {
        type: "manually",
        reasonId: response?.reason?.id,
        catracaId: catraca?.id,
        companyId: catraca?.companyId,
        branchId: catraca?.branchId,
        status: "success",
        message: `Liberação manual - ${response?.reason?.label}`,
        emit: "access",
      });
    });
  }
};
