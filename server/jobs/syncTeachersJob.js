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
        type: ["teacher"],
      },
    });

    logger.info(
      "Total de Professores a serem sincronizadas: " +
        response?.teachers?.length || 0
    );
    if (response?.teachers?.length > 0) {
      const repoPerson = AppDataSource.getRepository("Person");
      const repoTeacher = AppDataSource.getRepository("Teacher");
      const repoWorkTime = AppDataSource.getRepository("WorkTime");

      for (const item of response?.teachers) {
        const { workTimes, ...payload } = item;

        const person = await repoPerson.findOneBy({ id: payload?.personId });
        if (!person) {
          logger.warn(
            `Pessoa ${payload.personId} ainda não foi sincronizada para o professor ${payload.id}`
          );
          continue;
        }

        await repoTeacher
          .createQueryBuilder()
          .delete()
          .where("personId = :personId", { personId: payload.personId })
          .andWhere("id != :id", { id: payload.id })
          .execute();

        let teacher = await repoTeacher.findOneBy({
          id: payload.id,
        });

        if (!teacher) {
          teacher = repoTeacher.create(payload);
          await repoTeacher.save(teacher);
          logger.info("Professor criado de Id: " + payload?.id);
        } else {
          await repoWorkTime.delete({ teacherId: payload.id });
          delete payload.id;
          await repoTeacher.save({ ...teacher, ...payload });
          logger.info("Professor atualizado de Id: " + teacher?.id);
        }

        if (workTimes?.length > 0) {
          const workTimesPayload = repoWorkTime.create(workTimes);
          await repoWorkTime.save(workTimesPayload);
          logger.info(`Horários do Professor ${teacher?.id} atualizados.`);
        }

        await api.put(`/catracas/sync`, {
          companyId: catraca?.companyId,
          branchId: catraca?.branchId,
          catracaId: catraca?.id,
          type: "teacher",
          data: [
            {
              success: true,
              data: {
                id: teacher.id,
              },
            },
          ],
        });
      }
    }

    logger.info("Sincronização finalizada com sucesso.");
  } catch (err) {
    logger.error(
      "Não foi possível sincronizar os dados com a catraca e banco de dados.",
      err?.response?.data || err?.message
    );
  }
};
