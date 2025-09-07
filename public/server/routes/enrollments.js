const express = require("express");
const axios = require("axios");
const router = express.Router();
const { AppDataSource } = require("../ormconfig");

const api = axios.create({
  baseURL: "http://localhost:4003",
});

router.get("/:identifieCatraca", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("Enrollment");
    const enrollment = await repo.findOneBy({
      identifieCatraca: req?.params?.identifieCatraca,
    });

    return res.status(200).json(enrollment);
  } catch (err) {
    console.log("error", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

router.post("/", async (req, res) => {
  const {
    id,
    status,
    startDate,
    endDate,
    identifierCatraca,
    picture,
    student,
  } = req.body || {};

  const payload = {
    id,
    name: student?.name,
    status,
    startDate,
    endDate,
    identifierCatraca,
    picture,
    studentId: student?.id,
    studentName: student?.name,
  };

  try {
    const repo = AppDataSource.getRepository("Enrollment");
    let enrollment = await repo.findOneBy({ identifierCatraca });

    if (!enrollment) {
      enrollment = repo.create(payload);
      await repo.save(enrollment);
    } else {
      await repo.save({ ...enrollment, ...payload });
    }

    return res.status(201).json(enrollment);
  } catch (err) {
    console.log("error", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

module.exports = router;
