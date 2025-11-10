const axios = require("axios");
const { AppDataSource } = require("../ormconfig");
const logger = require("../utils/logger"); // Importe o logger configurado

const api = axios.create({
  baseURL: process.env.BASE_URL,
});

module.exports = async function job() {
  try {
    const repoCatraca = AppDataSource.getRepository("Catraca");
    const catracas = await repoCatraca.find();
    const catraca = catracas?.[0];

    const repoEnrollment = AppDataSource.getRepository("Enrollment");
    const enrollments = await repoEnrollment.find();

    for (const item of enrollments) {
      const { data: exists } = await api.get(
        `/catracas/exists-enrollment/${item.id}`,
        {
          params: {
            clientId: catraca.clientId,
            clientSecret: catraca.clientSecret,
            machineKey: catraca.machineKey,
            machineName: "PC Name",
            type: ["enrollment"],
          },
        }
      );

      if (!exists) {
        await repoEnrollment.delete({ id: item.id });
        logger.info(
          `Matrícula ${item.id} removida do banco local por não existir no banco online.`
        );
      }
    }

    logger.info("Verificação finalizada com sucesso.");
  } catch (err) {
    console.log(err);
    logger.error(
      "Não foi possível verificar os dados locais com o banco de dados online.",
      err?.response?.data || err?.message
    );
  }
};
