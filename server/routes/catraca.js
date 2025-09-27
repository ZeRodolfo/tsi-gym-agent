const express = require("express");
const axios = require("axios");
const router = express.Router();
const { AppDataSource } = require("../ormconfig");
const { Catraca } = require("../entities/Catraca");

const api = axios.create({
  baseURL: process.env.BASE_URL || "http://localhost:4003",
});

router.get("/current", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("Catraca");
    const catracas = await repo.find();

    return res.status(200).json(catracas?.[0] || null);
  } catch (err) {
    console.log("error", err);
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
      return res.status(201).json(catraca);
    }

    return res.status(404).json({
      message: "Catraca não encontrada. Verifique as credencias de acesso.",
    });
  } catch (err) {
    console.log("error", err);
    return res.status(400).json({
      message: err?.response?.data?.message,
      host: process.env.BASE_URL,
    });
  }
});

module.exports = router;
