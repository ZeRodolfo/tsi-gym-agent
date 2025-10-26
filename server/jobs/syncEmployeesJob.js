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
        type: ["employee"],
      },
    });

    logger.info(
      "Total de Funcionários a serem sincronizadas: " +
        response?.employees?.length || 0
    );
    if (response?.employees?.length > 0) {
      const repoPerson = AppDataSource.getRepository("Person");
      const repoEmployee = AppDataSource.getRepository("Employee");
      const repoWorkTime = AppDataSource.getRepository("WorkTime");

      for (const item of response?.employees) {
        const { workTimes, ...payload } = item;

        const person = await repoPerson.findOneBy({ id: payload?.personId });
        if (!person) {
          logger.warn(
            `Pessoa ${payload.personId} ainda não foi sincronizada para o funcionário ${payload.id}`
          );
          continue;
        }

        let employee = await repoEmployee.findOneBy({
          id: payload.id,
        });

        if (!employee) {
          employee = repoEmployee.create(payload);
          await repoEmployee.save(employee);
          logger.info("Funcionário criado de Id: " + payload?.id);
        } else {
          await repoWorkTime.delete({ employeeId: payload.id });
          delete payload.id;
          await repoEmployee.save({ ...employee, ...payload });
          logger.info("Funcionário atualizado de Id: " + employee?.id);
        }

        if (workTimes?.length > 0) {
          const workTimesPayload = repoWorkTime.create(workTimes);
          await repoWorkTime.save(workTimesPayload);
          logger.info(`Horários do Funcionário ${employee?.id} atualizados.`);
        }

        await api.put(`/catracas/sync`, {
          companyId: catraca?.companyId,
          branchId: catraca?.branchId,
          catracaId: catraca?.id,
          type: "employee",
          data: [
            {
              success: true,
              data: {
                id: employee.id,
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
