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

    const { data: existsEnrollment } = await api.get(
      `/catracas/exists-enrollment`,
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

    const ids = existsEnrollment?.map((e) => e.id) || [];

    if (ids.length === 0) {
      logger.warn(
        "⚠️ Nenhum registro remoto encontrado, ignorando exclusão local."
      );
      return;
    }

    logger.info("Total de Matrículas existentes no servidor: " + ids.length);

    const repoEnrollment = AppDataSource.getRepository("Enrollment");
    const results = await repoEnrollment
      .createQueryBuilder()
      .select()
      .where("id NOT IN (:...ids)", { ids })
      .andWhere("studentId NOT LIKE :deleted", { deleted: "deleted-%" })
      .execute();

    if (results?.length > 0) {
      for (const r of results) {
        logger.info(`Excluindo matrícula local Id: ${r.Enrollment_id}`);

        await repoEnrollment.update(
          {
            id: r.Enrollment_id,
          },
          {
            studentId: "deleted-" + Date.now(),
          }
        );
      }

      logger.info(
        `✅ Verificação finalizada. Registros excluídos: ${results.length}`
      );
    }
  } catch (err) {
    console.log(err);
    logger.error(
      "Não foi possível verificar os dados locais com o banco de dados online.",
      err?.response?.data || err?.message
    );
  }
};
