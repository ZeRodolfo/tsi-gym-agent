const express = require("express");
const router = express.Router();
const { AppDataSource } = require("../ormconfig");
const logger = require("../utils/logger"); // Importe o logger configurado

router.post("/", async (req, res) => {
  try {
    const repoWorkTime = AppDataSource.getRepository("WorkTime");
    const repoEmployee = AppDataSource.getRepository("Employee");

    const { workTimes, person, ...rest } = req.body;
    const { address, ...restPerson } = person || {};
    const payload = {
      ...rest,
      ...restPerson,
      addressZipcode: address?.zipcode,
      addressStreet: address?.street,
      addressNumber: address?.number,
      addressNeighborhood: address?.neighborhood,
      addressComplement: address?.complement,
      addressCity: address?.city,
      addressState: address?.state,
    };

    let employee = await repoEmployee.findOneBy({
      id: payload.id,
      identifierCatraca: person?.identifierCatraca,
    });

    let isNew = false;
    if (!employee) {
      isNew = true;
      employee = repoEmployee.create(payload);
      await repoEmployee.save(employee);
      logger.info("Funcionário criado.");
    } else {
      delete payload.id;
      await repoEmployee.save({ ...employee, ...payload });
      logger.info("Funcionário atualizado.");
    }

    await repoWorkTime.delete({ employeeId: employee.id });
    if (workTimes?.length > 0) {
      const workTimesPayload = repoWorkTime.create(workTimes);
      await repoWorkTime.save(workTimesPayload);
      logger.info("Horários atualizados.");
    }

    let diffPicture = employee?.picture !== person?.picture;
    if (isNew) diffPicture = true;

    return res.status(201).json({
      diffPicture,
      data: employee,
    });
  } catch (err) {
    logger.error("Não foi possível atualizar/cadastrar professor", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const id = req.body?.id;
    const repoEmployee = AppDataSource.getRepository("Employee");
    let employee = await repoEmployee.findOneBy({ id });

    if (!employee) {
      logger.info("Funcionário não encontrado para o ID: " + id);
      return null;
    }

    const { workTimes, person, ...rest } = req.body || {};
    const { address, ...restPerson } = person || {};
    const payload = {
      ...rest,
      ...restPerson,
      addressZipcode: address?.zipcode,
      addressStreet: address?.street,
      addressNumber: address?.number,
      addressNeighborhood: address?.neighborhood,
      addressComplement: address?.complement,
      addressCity: address?.city,
      addressState: address?.state,
    };

    await repoEmployee.save(payload);

    const repoWorkTime = AppDataSource.getRepository("WorkTime");
    await repoWorkTime.delete({ employeeId: id });

    if (workTimes?.length > 0) {
      const workTimesPayload = repoWorkTime.create(workTimes);
      await repoWorkTime.save(workTimesPayload);
      logger.info("Horários atualizados.");
    }

    return res.status(200).json(payload);
  } catch (err) {
    logger.error("Não foi possível atualizar os dados base da matrícula", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

router.patch("/update-picture", async (req, res) => {
  const { identifierCatraca, picture } = req.body || {};

  try {
    const repoEmployee = AppDataSource.getRepository("Employee");
    const employees = await repoEmployee.findBy({ identifierCatraca });

    if (!employees?.length) {
      logger.info(
        "Funcionário não encontrado para o identificador: " + identifierCatraca
      );
      return null;
    }

    const payloads = [];
    for (const employee of employees) {
      const payload = { ...employee, picture };
      await repoEmployee.save(payload);
      payloads.push(payload);
    }

    return res.status(200).json(payloads);
  } catch (err) {
    logger.error("Não foi possível atualizar a imagem do funcionário", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

// remover da catraca também depois
router.delete("/:id", async (req, res) => {
  try {
    const repoEnrollment = AppDataSource.getRepository("Enrollment");
    const repoTeacher = AppDataSource.getRepository("Teacher");
    const repoEmployee = AppDataSource.getRepository("Employee");
    const repoWorkTime = AppDataSource.getRepository("WorkTime");

    let existsAnotherRecord = false;
    const item = await repoEmployee.findOne({
      where: { id: req?.params?.id },
    });
    if (item) {
      const existsEnrollment = await repoEnrollment.findOne({
        where: {
          identifierCatraca: item.identifierCatraca,
        },
      });
      const existsTeacher = await repoTeacher.findOne({
        where: {
          identifierCatraca: item.identifierCatraca,
        },
      });

      if (existsEnrollment || existsTeacher) existsAnotherRecord = true;

      await repoWorkTime.delete({
        employeeId: req?.params?.id,
      });
      await repoEmployee.delete({
        id: req?.params?.id,
      });
    }

    return res
      .status(200)
      .json({ existsAnotherRecord, message: "Excluída com sucesso." });
  } catch (err) {
    logger.error("Não foi possível excluir o funcionário", err);
    return res.status(400).json({ message: err?.message });
  }
});

module.exports = router;
