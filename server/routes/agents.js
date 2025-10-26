const express = require("express");
const axios = require("axios");
const router = express.Router();
const { AppDataSource } = require("../ormconfig");
// const { Agent } = require("../entities/Agent");
const logger = require("../utils/logger"); // Importe o logger configurado

const api = axios.create({
  baseURL: process.env.BASE_URL || "http://localhost:4003",
});

router.get("/", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("Agent");
    const agent = await repo.findOne();

    return res.status(200).json(agent);
  } catch (err) {
    logger.error("error", err);
    return res
      .status(400)
      .json({ message: err?.response?.data?.message || err?.message });
  }
});

router.post("/validate-tokens", async (req, res) => {
  const { clientId, clientSecret, machineKey, machineName } = req.body;

  try {
    const { data } = await api.post(`/agents/validate-tokens`, {
      machine: { key: machineKey, name: machineName },
      clientId,
      clientSecret,
    });

    logger.info(`Get data:`, data);

    if (data) {
      const repo = AppDataSource.getRepository("Agent");
      let agent = await repo.findOneBy({ id: data?.id });

      if (!agent)
        agent = repo.create({
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
      else agent.lastSync = new Date();

      await repo.save(agent);

      logger.info(`Agente data:`, agent);

      return res.status(201).json(agent);
    }

    return res.status(404).json({
      message: "Agente não encontrada. Verifique as credencias de acesso.",
    });
  } catch (err) {
    logger.error(`Não foi possível validar o token:`, {
      payload: { clientId, clientSecret, machineKey, machineName },
      messageError: err?.response?.data,
    });
    return res.status(400).json({
      message: err?.response?.data?.message || err?.message,
      host: process.env.BASE_URL,
    });
  }
});

module.exports = router;
