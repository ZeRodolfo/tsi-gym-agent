const express = require("express");
const router = express.Router();
const { AppDataSource } = require("../ormconfig");
const logger = require("../utils/logger"); // Importe o logger configurado

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

module.exports = router;
