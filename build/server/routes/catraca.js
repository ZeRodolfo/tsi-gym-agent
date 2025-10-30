const express = require("express");
const axios = require("axios");
const { Not, IsNull } = require("typeorm");

const router = express.Router();
const { AppDataSource } = require("../ormconfig");
// const { Catraca } = require("../entities/Catraca");
const logger = require("../utils/logger"); // Importe o logger configurado

const api = axios.create({
  baseURL: process.env.BASE_URL || "http://localhost:4003",
});

router.get("/", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("Catraca");
    const catraca = await repo.findOne({
      where: {
        ip: Not(IsNull()),
      },
    });

    return res.status(200).json(catraca);
  } catch (err) {
    logger.error("error", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("Catraca");
    const catracas = await repo.find({
      relations: ["company"],
    });

    return res.status(200).json(catracas);
  } catch (err) {
    logger.error("error", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

router.post("/validate-tokens", async (req, res) => {
  const { clientId, clientSecret, machineKey, machineName } = req.body;

  try {
    const { data } = await api.post(`/catracas/validate-tokens`, {
      machine: { key: machineKey, name: machineName },
      clientId,
      clientSecret,
    });

    logger.info(`Get data:`, data);

    if (data) {
      const repo = AppDataSource.getRepository("Catraca");
      let catraca = await repo.findOneBy({ id: data?.id });

      if (!catraca)
        catraca = repo.create({
          id: data?.id,
          name: data?.name,
          note: data?.note,
          machineId: machineKey,
          departmentName: data?.department?.name,
          modelType: data?.model?.type,
          modelName: data?.model?.name,
          companyId: data?.company?.id,
          companyName: data?.company?.name || data?.company?.companyName,
          branchId: data?.branch?.id,
          branchName:
            data?.branch?.name ||
            data?.company?.name ||
            data?.company?.companyName,
          clientId,
          clientSecret,
          lastSync: new Date(),
        });
      else catraca.lastSync = new Date();

      await repo.save(catraca);

      logger.info(`Catraca data:`, catraca);

      return res.status(201).json(catraca);
    }

    return res.status(404).json({
      message: "Catraca não encontrada. Verifique as credencias de acesso.",
    });
  } catch (err) {
    logger.error(`Não foi possível validar o token:`, {
      payload: { clientId, clientSecret, machineKey, machineName },
      messageError: err?.response?.data,
    });
    return res.status(400).json({
      message: err?.response?.data?.message,
      host: process.env.BASE_URL,
    });
  }
});

router.post("/", async (req, res) => {
  const {
    type,
    ip,
    port,
    username,
    password,
    ipLocal,
    catraSideToEnter,
    customAuthMessage,
    customDenyMessage,
    customNotIdentifiedMessage,
    customMaskMessage,
    enableCustomAuthMessage,
    enableCustomDenyMessage,
    enableCustomNotIdentifiedMessage,
    enableCustomMaskMessage,
  } = req.body || {};

  const repoCatraca = AppDataSource.getRepository("Catraca");
  const allCatraca = await repoCatraca.find();
  const catraca = allCatraca?.[0];

  const payload = {
    type,
    ip,
    port,
    username,
    password,
    customAuthMessage,
    customDenyMessage,
    customNotIdentifiedMessage,
    customMaskMessage,
    enableCustomAuthMessage,
    enableCustomDenyMessage,
    enableCustomNotIdentifiedMessage,
    enableCustomMaskMessage,
    ipLocal,
    catraSideToEnter,
    catracaId: catraca?.id || null,
  };

  // try {
  //   const repo = AppDataSource.getRepository("Settings");
  //   const allSettings = await repo.find({
  //     where: {
  //       type: "catraca",
  //     },
  //   });
  //   let settings = allSettings?.[0];

  //   if (!settings) {
  //     settings = repo.create(payload);
  //     await repo.save(settings);
  //   } else {
  //     settings = { ...settings, ...payload };
  //     await repo.save(settings);
  //   }

  //   return res.status(201).json(settings);
  // } catch (err) {
  //   logger.error("error", err);
  //   return res.status(400).json({ message: err?.response?.data?.message });
  // }
  return res.status(201).json(null);
});

module.exports = router;
