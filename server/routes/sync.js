const express = require("express");
const axios = require("axios");
const router = express.Router();
const { AppDataSource } = require("../ormconfig");

const api = axios.create({
  baseURL: process.env.BASE_URL,
});

router.get("/", async (req, res) => {
  try {
    const repoCatraca = AppDataSource.getRepository("Catraca");
    const catracas = await repoCatraca.find();
    const catraca = catracas?.[0] || {};

    const { data: enrollments } = await api.get("/catracas/sync", {
      params: {
        clientId: catraca.clientId,
        clientSecret: catraca.clientSecret,
        machineKey: catraca.machineKey,
        machineName: "PC Name",
      },
    });

    const repo = AppDataSource.getRepository("Enrollment");
    for (const item of enrollments) {
      const {
        id,
        status,
        startDate,
        endDate,
        extendedAt,
        code,
        student,
        companyId,
        branchId,
      } = item;

      const payload = {
        id,
        code,
        name: student?.person?.name,
        status,
        startDate,
        endDate,
        extendedAt,
        identifierCatraca: student?.person?.identifierCatraca,
        picture: student?.person?.picture,
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

      let enrollment = await repo.findOneBy({
        identifierCatraca: student.person.identifierCatraca,
      });
      if (!enrollment) {
        enrollment = repo.create(payload);
        await repo.save(enrollment);
      } else {
        await repo.save({ ...enrollment, ...payload });
      }
    }

    return res.status(201).json({ message: "Sincronizado com sucesso!" });
  } catch (err) {
    console.log("error", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const repoCatraca = AppDataSource.getRepository("Catraca");
    const catracas = await repoCatraca.find();
    if (!catracas?.length)
      return res
        .status(200)
        .json({ message: "Não existe Catraca configurada." });

    const catraca = catracas?.[0];
    const repo = AppDataSource.getRepository("Historic");
    // Busca os não sincronizados
    const unsynced = await repo.find({ where: { synced: false } });

    if (unsynced.length === 0) {
      console.log("Nenhum histórico pendente para sincronizar.");
      return res
        .status(200)
        .json({ message: "Não existe Histórico para ser enviado." });
    }

    const response = await api.post(
      "/lessons-attendances/sync",
      unsynced?.map(({ synced, ...item }) => item),
      {
        headers: {
          "x-client-id": catraca?.clientId,
          "x-client-secret": catraca?.clientSecret,
          "x-company-id": catraca?.companyId,
          "x-branch-id": catraca?.branchId,
        },
      }
    );

    if (response.status === 201) {
      // Marca como sincronizado
      for (const history of unsynced) {
        history.synced = true;
      }
      await repo.save(unsynced);
      console.log("Históricos sincronizados com sucesso!");
    }

    return res.status(201).json({ message: "Histórico enviado com sucesso." });
  } catch (err) {
    console.log("error", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

module.exports = router;
