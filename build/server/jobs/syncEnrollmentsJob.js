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
    if (!catraca?.ip) return;

    const { data: response } = await api.get("/catracas/sync", {
      params: {
        clientId: catraca.clientId,
        clientSecret: catraca.clientSecret,
        machineKey: catraca.machineKey,
        machineName: "PC Name",
        type: ["enrollment"],
      },
    });

    logger.info(
      "Total de Matrículas a serem sincronizadas: " +
        response?.enrollments?.length || 0
    );

    if (response?.enrollments?.length) {
      const repoEnrollment = AppDataSource.getRepository("Enrollment");
      const repoPerson = AppDataSource.getRepository("Person");

      for (const item of response?.enrollments) {
        const {
          id,
          status,
          startDate,
          endDate,
          extendedAt,
          code,
          student,
          companyId,
          branchId,
          createdAt,
          updatedAt,
        } = item;

        const person = await repoPerson.findOneBy({ id: student?.personId });
        if (!person) {
          logger.warn(
            `Pessoa ${student.personId} ainda não foi sincronizada para a matrícula ${id}`
          );
          continue;
        }

        const payload = {
          code,
          status,
          startDate,
          endDate,
          extendedAt,
          companyId,
          branchId,
          studentId: student?.id,
          personId: student?.personId,
          createdAt,
          updatedAt,
        };

        let enrollment = await repoEnrollment.findOneBy({
          id,
        });

        if (!enrollment) {
          enrollment = repoEnrollment.create({ id, ...payload });
          await repoEnrollment.save(enrollment);
          logger.info("Matrícula criada de Id: " + id);
        } else {
          await repoEnrollment.save({ ...enrollment, ...payload });
          logger.info("Matrícula atualizada de Id: " + id);
        }

        await api.put(`/catracas/sync`, {
          companyId: catraca?.companyId,
          branchId: catraca?.branchId,
          catracaId: catraca?.id,
          type: "enrollment",
          data: [
            {
              success: true,
              data: {
                id,
              },
            },
          ],
        });
      }
    }

    logger.info("Sincronização finalizada com sucesso.");
  } catch (err) {
    console.log(err);
    logger.error(
      "Não foi possível sincronizar os dados com a catraca e banco de dados.",
      err?.response?.data || err?.message
    );
  }
};
