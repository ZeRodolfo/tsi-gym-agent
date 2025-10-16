const axios = require("axios");
const { AppDataSource } = require("../ormconfig");
const { Enrollment } = require("../entities/Enrollment");
const logger = require("../utils/logger"); // Importe o logger configurado

const api = axios.create({
  baseURL: process.env.BASE_URL,
});

module.exports = async function job() {
  try {
    const repoCatraca = AppDataSource.getRepository("Catraca");
    const catracas = await repoCatraca.find();
    if (!catracas?.length) throw new Error("Não existe Catraca configurada.");
    const catraca = catracas?.[0];

    const repo = AppDataSource.getRepository(Enrollment);
    const enrollments = await repo.find({
      where: {
        synced: true,
      },
    });
    logger.info(`Matrículas encontradas localmente ${enrollments?.length}...`);

    const response = await api.post(
      "/enrollments/sync",
      enrollments?.map((item) => item.identifierCatraca),
      {
        headers: {
          "x-client-id": catraca?.clientId,
          "x-client-secret": catraca?.clientSecret,
          "x-company-id": catraca?.companyId,
          "x-branch-id": catraca?.branchId,
        },
      }
    );

    if (response?.status === 200)
      logger.info(
        `Enviado para o agente sincronizar ${response.data.length} matriculas...`
      );
  } catch (error) {
    logger.error(
      "Erro ao solicitar sincronização das matrículas:",
      error?.response?.data || error
    );
  }
};
