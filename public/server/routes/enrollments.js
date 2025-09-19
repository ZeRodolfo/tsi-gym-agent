const express = require("express");
const axios = require("axios");
const router = express.Router();
const { AppDataSource } = require("../ormconfig");

const api = axios.create({
  baseURL: process.env.BASE_URL || "http://localhost:4003",
});

router.get("/", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("Enrollment");
    const enrollments = await repo.find();

    return res.status(200).json(enrollments);
  } catch (err) {
    console.log("error", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
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
    extendedAt,
    identifierCatraca,
    code,
    picture,
    student,
    companyId,
    branchId,
  } = req.body || {};

  const payload = {
    id,
    code,
    name: student?.name,
    status,
    startDate,
    endDate,
    extendedAt,
    identifierCatraca,
    picture,
    companyId,
    branchId,
    studentId: student?.id,
    studentName: student?.name,
    birthdate: student?.person?.birthdate,
    addressZipcode: student?.person?.address?.zipcode,
    addressStreet: student?.person?.address?.street,
    addressNumber: student?.person?.address?.number,
    addressNeighborhood: student?.person?.address?.neighborhood,
    addressComplement: student?.person?.address?.complement,
    addressCity: student?.person?.address?.city,
    addressState: student?.person?.address?.state,
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
