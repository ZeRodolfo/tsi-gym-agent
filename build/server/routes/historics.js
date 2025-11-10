const express = require("express");
// const axios = require("axios");
const router = express.Router();
const { AppDataSource } = require("../ormconfig");
const logger = require("../utils/logger"); // Importe o logger configurado

// const api = axios.create({
//   baseURL: process.env.BASE_URL || "http://localhost:4003",
// });

router.get("/", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("Historic");
    const historics = await repo.find({
      order: { attendedAt: "desc" },
      take: 25,
      relations: [
        "person",
        "person.address",
        "enrollment",
        "teacher",
        "employee",
      ],
    });

    return res.status(200).json(historics);
  } catch (err) {
    logger.error("error", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

router.get("/last-access", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("Historic");
    const historics = await repo.find({
      relations: [
        "person",
        "person.address",
        "enrollment",
        "teacher",
        "employee",
      ],
      order: { attendedAt: "desc" },
      take: 1,
    });

    return res.status(200).json(historics?.[0] || null);
  } catch (err) {
    logger.error("error", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

router.post("/", async (req, res) => {
  const {
    personId,
    studentId,
    enrollmentId,
    identifierCatraca,
    catracaId,
    companyId,
    branchId,
    reasonId,
    type,
    status,
    message,
    emit,
  } = req.body || {};

  const payload = {
    personId,
    studentId,
    enrollment: { id: enrollmentId, identifierCatraca }, // cria vínculo via FK
    catraca: { id: catracaId },
    companyId,
    branchId,
    attendedAt: new Date(),
    status,
    message,
    reasonId,
    type,
  };

  if (!enrollmentId) delete payload.enrollment;

  try {
    const repo = AppDataSource.getRepository("Historic");
    const historic = repo.create(payload);
    await repo.save(historic);
    if (emit) {
      const io = req.app.get("io");
      io.emit(emit, historic);
    }
    return res.status(201).json(historic);
  } catch (err) {
    logger.error("error", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

module.exports = router;
