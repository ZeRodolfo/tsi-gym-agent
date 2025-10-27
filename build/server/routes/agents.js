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
    const agents = await repo.find({
      relations: ["company", "company.address"],
    });

    return res.status(200).json(agents?.[0]);
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

    if (data) {
      const companyRepo = AppDataSource.getRepository("Company");
      let company = await companyRepo.findOne({
        where: {
          id: data?.companyId,
        },
        relations: ["address"],
      });

      if (data?.company) {
        const { address, ...companyData } = data?.company;
        if (!company) {
          company = companyRepo.create({ ...companyData, address });
          await companyRepo.save(company);
        } else {
          company = { ...company, ...companyData, address };
          await companyRepo.save(company);
        }
      }

      const repo = AppDataSource.getRepository("Agent");
      let agent = await repo.findOneBy({ id: data?.id });

      if (!agent)
        agent = repo.create({
          id: data?.id,
          name: data?.name,
          note: data?.note,
          machineId: machineKey,
          companyId: data?.company?.id,
          branchId: data?.branch?.id,
          clientId,
          clientSecret,
          lastSync: new Date(),
        });
      else agent.lastSync = new Date();

      await repo.save(agent);

      const repoCatraca = AppDataSource.getRepository("Catraca");
      const repoPrinter = AppDataSource.getRepository("Printer");

      await repoCatraca.deleteAll();
      await repoPrinter.deleteAll();

      for (const device of data?.devices) {
        if (device.type === "catraca") {
          for (const item of device.catracas) {
            const payload = {
              id: item.id,
              name: item.name,
              note: item.note,
              departmentName: item?.department?.name,
              modelType: item?.model?.type,
              modelName: item?.model?.name,
              clientId: item.clientId,
              clientSecret: item.clientSecret,
              ip: item.ip,
              username: item.username,
              password: item.password,
              customAuthMessage: item.customAuthMessage,
              customDenyMessage: item.customDenyMessage,
              customNotIdentifiedMessage: item.customNotIdentifiedMessage,
              customMaskMessage: item.customMaskMessage,
              enableCustomAuthMessage: item.enableCustomAuthMessage,
              enableCustomDenyMessage: item.enableCustomDenyMessage,
              enableCustomNotIdentifiedMessage:
                item.enableCustomNotIdentifiedMessage,
              enableCustomMaskMessage: item.enableCustomMaskMessage,
              ipLocal: item.ipLocal,
              portLocal: item.portLocal,
              catraSideToEnter: item.catraSideToEnter,
              catracaId: item?.id || null,
              companyId: item.companyId,
              branchId: item.branchId,
            };

            catraca = repoCatraca.create(payload);
            await repoCatraca.save(catraca);
          }
        } else {
          for (const item of device.printers) {
            const payload = {
              id: item.id,
              name: item.name,
              note: item.note,
              active: item.active,
              type: item.type,
              clientId: item.clientId,
              clientSecret: item.clientSecret,
              paperWidth: item.paperWidth,
              autoCut: item.autoCut,
              partialCut: item.partialCut,
              charEncoding: item.charEncoding,
              departmentId: item?.departmentId,
              agentDeviceId: item?.agentDeviceId,
              agentId: device.id,
              ipAddress: item.ipAddress,
              port: item.port,
              connectionType: item.connectionType,
              interface: item?.interface,
              companyId: item.companyId,
              branchId: item.branchId,
            };

            printer = repoPrinter.create(payload);
            await repoPrinter.save(printer);
          }
        }
      }

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
