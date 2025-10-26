const express = require("express");
const axios = require("axios");
const router = express.Router();
const { AppDataSource } = require("../ormconfig");
const logger = require("../utils/logger"); // Importe o logger configurado

const api = axios.create({
  baseURL: process.env.BASE_URL,
});

router.get("/", async (req, res) => {
  try {
    const repoCatraca = AppDataSource.getRepository("Catraca");
    const catracas = await repoCatraca.find();
    const catraca = catracas?.[0] || {};

    const { data: response } = await api.get("/catracas/sync", {
      params: {
        clientId: catraca.clientId,
        clientSecret: catraca.clientSecret,
        machineKey: catraca.machineKey,
        machineName: "PC Name",
      },
    });

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

    return res.status(201).json({ message: "Sincronizado com sucesso!" });
  } catch (err) {
    logger.error(
      "Não foi possível salvar as matrículas no banco de dados.",
      err
    );
    return res.status(400).json({
      message:
        err?.response?.data?.message ||
        err?.message ||
        "Não foi possível inserir o registro",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const repoCatraca = AppDataSource.getRepository("Catraca");
    const catracas = await repoCatraca.find();
    if (!catracas?.length)
      return res
        .status(200)
        .json({ message: "Não existe Catraca configurada." });

    const catraca = catracas?.[0];
    const repo = AppDataSource.getRepository("Historic");
    // Busca os não sincronizados
    const unsynced = await repo.find({ where: { synced: false } });

    if (unsynced.length === 0) {
      logger.info("Nenhum histórico pendente para sincronizar.");
      return res
        .status(200)
        .json({ message: "Não existe Histórico para ser enviado." });
    }

    const response = await api.post(
      "/lessons-attendances/sync",
      unsynced?.map(({ synced, ...item }) => item),
      {
        headers: {
          "x-client-id": catraca?.clientId,
          "x-client-secret": catraca?.clientSecret,
          "x-company-id": catraca?.companyId,
          "x-branch-id": catraca?.branchId,
        },
      }
    );

    if (response.status === 201) {
      // Marca como sincronizado
      for (const history of unsynced) {
        history.synced = true;
      }
      await repo.save(unsynced);
      logger.info("Históricos sincronizados com sucesso!");
    }

    return res.status(201).json({ message: "Histórico enviado com sucesso." });
  } catch (err) {
    console.log(err);
    // logger.error(
    //   "Histórico de acessos na catraca não foram sincronizados com o servidor VPS.",
    //   err
    // );
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

module.exports = router;
