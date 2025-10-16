const express = require("express");
// const axios = require("axios");
const router = express.Router();
const { AppDataSource } = require("../ormconfig");
const logger = require("../utils/logger"); // Importe o logger configurado

// const api = axios.create({
//   baseURL: process.env.BASE_URL || "http://localhost:4003",
// });

router.post("/", async (req, res) => {
  try {
    const repoWorkTime = AppDataSource.getRepository("WorkTime");
    const repoTeacher = AppDataSource.getRepository("Teacher");

    const { workTimes, person, ...rest } = req?.body || {};
    const payload = { ...rest, ...person };

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

    await repoWorkTime.delete({ teacherId: teacher.id });
    if (workTimes?.length > 0) {
      const workTimesPayload = repoWorkTime.create(workTimes);
      await repoWorkTime.save(workTimesPayload);
      logger.info("Horários atualizados.");
    }

    return res.status(201).json({
      diffPicture: teacher?.picture !== person?.picture,
      data: teacher,
    });
  } catch (err) {
    logger.error("Não foi possível atualizar/cadastrar professor", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const id = req.body?.id;
    const repoTeacher = AppDataSource.getRepository("Teacher");
    let teacher = await repoTeacher.findOneBy({ id });

    if (!teacher) {
      logger.info("Professor não encontrado para o ID: " + id);
      return null;
    }

    const { workTimes, person, ...rest } = req.body || {};
    const payload = { ...rest, ...person };

    await repoTeacher.save(payload);

    const repoWorkTime = AppDataSource.getRepository("WorkTime");
    await repoWorkTime.delete({ teacherId: id });

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
    const repoTeacher = AppDataSource.getRepository("Teacher");
    const teachers = await repoTeacher.findBy({ identifierCatraca });

    if (!teachers?.length) {
      logger.info(
        "Professor não encontrado para o identificador: " + identifierCatraca
      );
      return null;
    }

    const payloads = [];
    for (const teacher of teachers) {
      const payload = { ...teacher, picture };
      await repoTeacher.save(payload);
      payloads.push(payload);
    }

    return res.status(200).json(payloads);
  } catch (err) {
    logger.error("Não foi possível atualizar a imagem do professor", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("Teacher");
    const repoWorkTime = AppDataSource.getRepository("WorkTime");

    await repoWorkTime.delete({
      teacherId: req?.params?.id,
    });
    await repo.delete({
      id: req?.params?.id,
    });

    return res.status(200).json({ message: "Excluída com sucesso." });
  } catch (err) {
    logger.error("Não foi possível excluir o professor", err);
    return res.status(400).json({ message: err?.message });
  }
});

module.exports = router;
