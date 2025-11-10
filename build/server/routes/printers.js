const express = require("express");
const router = express.Router();
const { AppDataSource } = require("../ormconfig");
const logger = require("../utils/logger"); // Importe o logger configurado

router.get("/all", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("Printer");
    const printers = await repo.find({
      relations: ["company"],
    });

    return res.status(200).json(printers);
  } catch (err) {
    logger.error("error", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

router.get("/:printerId", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("Printer");
    const printer = await repo.findOne({
      where: { id: req?.params?.printerId },
      relations: ["company"],
    });

    return res.status(200).json(printer);
  } catch (err) {
    logger.error("Não foi possível recuperar a impressora", err);
    return res.status(400).json({ message: err?.message });
  }
});

router.post("/validate-tokens", async (req, res) => {
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

      return res.status(200).json(printer);
    }

    return res.status(400).json(null);
  } catch (err) {
    logger.error(
      "Não foi possível importar dados da impressora no servidor VPS.",
      err?.response?.data || err?.message
    );
    return res
      .status(400)
      .json({ message: err?.response?.data?.message || err?.message });
  }
});

module.exports = router;
