const express = require("express");
const axios = require("axios");
const router = express.Router();
const { AppDataSource } = require("../ormconfig");
const logger = require("../utils/logger"); // Importe o logger configurado

// const { Settings } = require("../entities/Settings");

const api = axios.create({
  baseURL: process.env.BASE_URL,
});

router.get("/", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("Settings");
    const settings = await repo.find({
      where: {
        type: "catraca",
      },
    });

    return res.status(200).json(settings?.[0] || null);
  } catch (err) {
    logger.error("error", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("Settings");
    const settings = await repo.find({
      relations: ["catraca", "printer", "printer.company"],
    });

    return res.status(200).json(settings);
  } catch (err) {
    logger.error("error", err);
    return res.status(400).json({ message: err?.response?.data?.message });
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

  try {
    const repo = AppDataSource.getRepository("Settings");
    const allSettings = await repo.find({
      where: {
        type: "catraca",
      },
    });
    let settings = allSettings?.[0];

    if (!settings) {
      settings = repo.create(payload);
      await repo.save(settings);
    } else {
      settings = { ...settings, ...payload };
      await repo.save(settings);
    }

    return res.status(201).json(settings);
  } catch (err) {
    logger.error("error", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

router.post("/printers/validate-tokens", async (req, res) => {
  try {
    const response = await api.post("/printers/validate-tokens", req.body, {
      // headers: {
      //   "x-client-id": catraca?.clientId,
      //   "x-client-secret": catraca?.clientSecret,
      //   "x-company-id": catraca?.companyId,
      //   "x-branch-id": catraca?.branchId,
      // },
    });

    if (response.status === 200) {
      const companyRepo = AppDataSource.getRepository("Company");
      let company = await companyRepo.findOne({
        where: {
          id: response?.data?.companyId,
        },
      });

      if (response.data?.company) {
        const { address, ...companyData } = response.data?.company;
        if (!company) {
          company = companyRepo.create({ ...companyData, ...(address || {}) });
          await companyRepo.save(company);
        } else {
          company = { ...company, ...companyData, ...(address || {}) };
          await companyRepo.save(company);
        }
      }

      const printerRepo = AppDataSource.getRepository("Printer");
      let printer = await printerRepo.findOne({
        where: {
          clientId: req.body?.clientId,
          clientSecret: req.body?.clientSecret,
        },
      });

      if (!printer) {
        printer = printerRepo.create(response.data);
        await printerRepo.save(printer);
      } else {
        printer = { ...printer, ...response.data };
        await printerRepo.save(printer);
      }

      const repo = AppDataSource.getRepository("Settings");
      let settings = await repo.findOne({
        where: { type: "printer", printer: { id: printer?.id } },
        relations: ["printer"],
      });

      if (!settings) {
        settings = repo.create({
          type: "printer",
          printerId: printer?.id || null,
        });
        await repo.save(settings);
      } else {
        settings = {
          ...settings,
          type: "printer",
          printerId: printer?.id || null,
        };
        await repo.save(settings);
      }

      return res.status(200).json(settings);
    }

    return res.status(400).json(null);
  } catch (err) {
    logger.error(
      "Não foi possível importar dados da impressora no servidor VPS.",
      err
    );
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

module.exports = router;
