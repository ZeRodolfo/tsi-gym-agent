const axios = require("axios");
const { AppDataSource } = require("../ormconfig");
const { Enrollment } = require("../entities/Enrollment");
const logger = require("../utils/logger"); // Importe o logger configurado

const api = axios.create({
  baseURL: process.env.BASE_URL,
});

// Set global para armazenar os IDs já sincronizados
const syncedPeopleIds = new Set();

module.exports = async function job() {
  // try {
  //   const repoCatraca = AppDataSource.getRepository("Catraca");
  //   const catracas = await repoCatraca.find();
  //   if (!catracas?.length) throw new Error("Não existe Catraca configurada.");
  //   const catraca = catracas?.[0];

  //   const repo = AppDataSource.getRepository(Enrollment);
  //   const enrollments = await repo.find({
  //     where: {
  //       synced: true,
  //     },
  //   });
  //   logger.info(`Matrículas encontradas localmente ${enrollments?.length}...`);

  //   const response = await api.post(
  //     "/enrollments/sync",
  //     enrollments?.map((item) => item.identifierCatraca),
  //     {
  //       headers: {
  //         "x-client-id": catraca?.clientId,
  //         "x-client-secret": catraca?.clientSecret,
  //         "x-company-id": catraca?.companyId,
  //         "x-branch-id": catraca?.branchId,
  //       },
  //     }
  //   );

  //   if (response?.status === 200)
  //     logger.info(
  //       `Enviado para o agente sincronizar ${response.data.length} matriculas...`
  //     );
  // } catch (error) {
  //   logger.error(
  //     "Erro ao solicitar sincronização das matrículas:",
  //     error?.response?.data || error
  //   );
  // }
  try {
    const repoCatraca = AppDataSource.getRepository("Catraca");
    const catracas = await repoCatraca.find({ relations: ["settings"] });
    const catraca = catracas?.[0];

    if (!catraca) return;

    const settings = catraca?.settings;
    if (!settings?.ip) return;

    const { data: response } = await api.get("/catracas/sync", {
      params: {
        clientId: catraca.clientId,
        clientSecret: catraca.clientSecret,
        machineKey: catraca.machineKey,
        machineName: "PC Name",
      },
    });

    logger.info(
      "Total de Pessoas a serem sincronizadas: " + response?.people?.length || 0
    );
    logger.info(
      "Total de Matrículas a serem sincronizadas: " +
        response?.enrollments?.length || 0
    );
    logger.info(
      "Total de Professores a serem sincronizadas: " +
        response?.teachers?.length || 0
    );
    logger.info(
      "Total de Funcionários a serem sincronizadas: " +
        response?.employees?.length || 0
    );

	delete response?.enrollments[0].picture 
	logger.info("TESTE", response?.enrollments[0])

    if (response?.people?.length) {
      logger.info(
        "Iniciando sincronização com a catraca: " + response?.people?.length ||
          0
      );

      const newPeople = response.people.filter(
        (p) => !syncedPeopleIds.has(p?.identifierCatraca)
      );

      // const apiCatraca = axios.create({
      //   // baseURL: `http://${settings?.ip}`,
      //   // headers: { "Content-Type": "application/json" },
      //   // timeout: 15000, // 15 segundos
      // });

      const {
        data: { session },
      } = await axios.post(
        `http://${settings?.ip}/login.fcgi`,
        {
          login: settings?.username,
          password: settings?.password,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 15000, // 15 segundos
        }
      );
      logger.info("SESSÂO", { session });
      if (!session) throw new Error("Falha ao autenticar na catraca");

      const peopleUsers = newPeople?.map((item) => ({
        id: item?.identifierCatraca,
        name: item?.name,
        registration: "",
      }));

      const timestamp = Math.floor(Date.now() / 1000);
      const peopleWithPicture = newPeople?.map((item) => {
        const picture = item?.picture;
        return {
          user_id: item?.identifierCatraca,
          image: picture
            ?.replace("data:image/png;base64,", "")
            ?.replace("data:image/jpeg;base64,", "")
            ?.replace(/\s/g, ""),
          timestamp,
        };
      });

	logger.info(
        "DADOS", {
          object: "users",
          values: peopleUsers,
        },
      );

if (peopleUsers.length) {
      await axios.post(
        `http://${settings?.ip}/create_or_modify_objects.fcgi?session=${session}`,
        {
          object: "users",
          values: peopleUsers,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 15000, // 15 segundos
        }
      );
}

      const chunkSize = 5;
      for (let i = 0; i < peopleWithPicture.length; i += chunkSize) {
        const chunk = peopleWithPicture.slice(i, i + chunkSize);
        console.log(
          `📸 Enviando lote ${i / chunkSize + 1} (${chunk.length} fotos)...`
        );

        await axios.post(
          `http://${settings?.ip}/user_set_image_list.fcgi?session=${session}`,
          {
            match: false,
            user_images: chunk,
          },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 15000, // 15 segundos
          }
        );
      }

      // Marca os IDs como sincronizados na memória
      newPeople?.forEach((p) => syncedPeopleIds.add(p?.identifierCatraca));
    }

    const repoEnrollment = AppDataSource.getRepository("Enrollment");
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
      const payload = {
        id,
        code,
        name: student?.person?.name,
        status,
        startDate,
        endDate,
        extendedAt,
        identifierCatraca: student?.person?.identifierCatraca,
        picture: student?.person?.picture,
        companyId,
        branchId,
        studentId: student?.id,
        studentName: student?.person?.name,
        birthdate: student?.person?.birthdate,
        addressZipcode: student?.person?.address?.zipcode,
        addressStreet: student?.person?.address?.street,
        addressNumber: student?.person?.address?.number,
        addressNeighborhood: student?.person?.address?.neighborhood,
        addressComplement: student?.person?.address?.complement,
        addressCity: student?.person?.address?.city,
        addressState: student?.person?.address?.state,
        createdAt,
        updatedAt,
      };

      if (!payload?.picture?.trim()) {
        logger.info(
          `Matrícula de ID ${payload.id} para o aluno ${payload?.name} não possui foto`,
          {
            id: payload.id,
            identifierCatraca: payload?.identifierCatraca,
            name: payload.name,
          }
        );
        continue;
      }

      let enrollment = await repoEnrollment.findOneBy({
        id,
        identifierCatraca: student.person.identifierCatraca,
      });

      if (!enrollment) {
        enrollment = repoEnrollment.create(payload);
        await repoEnrollment.save(enrollment);
        logger.info("Matrícula criada.");
      } else {
        delete payload.id;
        await repoEnrollment.save({ ...enrollment, ...payload });
        logger.info("Matrícula atualizada.");
      }
    }

    const repoCompany = AppDataSource.getRepository("Company");
    const repoTeacher = AppDataSource.getRepository("Teacher");
    const repoWorkTime = AppDataSource.getRepository("WorkTime");
    await repoWorkTime.deleteAll();
    await repoTeacher.deleteAll();

    for (const item of response?.teachers) {
      const { workTimes, person, ...rest } = item;
      const payload = { ...rest, ...person };

      if (!payload?.picture?.trim()) {
        logger.info(
          `Professor de ID ${payload.id} de nome ${payload?.name} não possui foto`,
          {
            id: payload.id,
            identifierCatraca: payload?.identifierCatraca,
            name: payload.name,
          }
        );
        continue;
      }

      if (payload?.companyId) {
        let company = await repoCompany.findOne({
          where: { id: payload?.companyId },
        });

        if (!company) {
          company = repoCompany.create({
            id: payload?.companyId,
            name: "Tsi Tech Gym",
            companyName: "Tsi Tech Gym",
          });
          await repoCompany.save(company);
          logger.info("Placeholder de Company criado:", company);
        }
      }

      let teacher = await repoTeacher.findOneBy({
        id: payload.id,
        identifierCatraca: person?.identifierCatraca,
      });

      if (!teacher) {
        teacher = repoTeacher.create(payload);
        await repoTeacher.save(teacher);
        logger.info("Professor criado.");
      } else {
        delete payload.id;
        await repoTeacher.save({ ...teacher, ...payload });
        logger.info("Professor atualizado.");
      }

      if (workTimes?.length > 0) {
        const workTimesPayload = repoWorkTime.create(workTimes);
        await repoWorkTime.save(workTimesPayload);
        logger.info("Horários atualizados.");
      }
    }

    const repoEmployee = AppDataSource.getRepository("Employee");
    await repoEmployee.deleteAll();

    for (const item of response?.employees) {
      const { workTimes, person, ...rest } = item;
      const payload = { ...rest, ...person };

      if (!payload?.picture?.trim()) {
        logger.info(
          `Funcionário de ID ${payload.id} de nome ${payload?.name} não possui foto`,
          {
            id: payload.id,
            identifierCatraca: payload?.identifierCatraca,
            name: payload.name,
          }
        );
        continue;
      }

      if (payload?.companyId) {
        let company = await repoCompany.findOne({
          where: { id: payload?.companyId },
        });

        if (!company) {
          company = repoCompany.create({
            id: payload?.companyId,
            name: "Tsi Tech Gym",
            companyName: "Tsi Tech Gym",
          });
          await repoCompany.save(company);
          logger.info("Placeholder de Company criado:", company);
        }
      }

      let employee = await repoEmployee.findOneBy({
        id: payload.id,
        identifierCatraca: person?.identifierCatraca,
      });

      if (!employee) {
        employee = repoEmployee.create(payload);
        await repoEmployee.save(employee);
        logger.info("Funcionário criado.");
      } else {
        delete payload.id;
        await repoEmployee.save({ ...employee, ...payload });
        logger.info("Funcionário atualizado.");
      }

      if (workTimes?.length > 0) {
        const workTimesPayload = repoWorkTime.create(workTimes);
        await repoWorkTime.save(workTimesPayload);
        logger.info("Horários atualizados.");
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
