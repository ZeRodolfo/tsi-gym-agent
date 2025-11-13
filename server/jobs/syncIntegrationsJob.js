const axios = require("axios");
const { AppDataSource } = require("../ormconfig");
const logger = require("../utils/logger"); // Importe o logger configurado

const api = axios.create({
  baseURL: process.env.BASE_URL,
});

module.exports = async function job() {
  try {
    const repoCatraca = AppDataSource.getRepository("Catraca");
    const catracas = await repoCatraca.find();
    const catraca = catracas?.[0];
    if (!catraca?.ip) return;

    const { data: response } = await api.get("/catracas/sync", {
      params: {
        clientId: catraca.clientId,
        clientSecret: catraca.clientSecret,
        machineKey: catraca.machineKey,
        machineName: "PC Name",
        type: ["integration"],
      },
    });

    logger.info(
      "Integration >> Total de Eventos a serem sincronizadas: " +
        response?.integrationEvents?.length || 0
    );

    if (response?.integrationEvents?.length) {
      const repoIntegration = AppDataSource.getRepository("Integration");

      for (const item of response?.integrationEvents) {
        const {
          id,
          source,
          eventType,
          eventData,
          code,
          codeSent,
          bookingNumber,
          uniqueToken,
          gymId,
          productId,
          slotId,
          classId,
          eventAt,
          expiresAt,
          checkinAt,
          companyId,
        } = item;

        const payload = {
          id,
          source,
          eventType,
          eventData,
          code,
          codeSent,
          bookingNumber,
          uniqueToken,
          gymId,
          productId,
          slotId,
          classId,
          eventAt,
          expiresAt,
          checkinAt,
          companyId,
        };

        let integration = await repoIntegration.findOneBy({
          id,
        });

        if (!integration) {
          integration = repoIntegration.create({ id, ...payload });
          await repoIntegration.save(integration);
          logger.info("Integration >> Evento criado de Id: " + id);
        } else {
          await repoIntegration.save({ ...integration, ...payload });
          logger.info("Integration >> Evento atualizado de Id: " + id);
        }

        await api.put(`/catracas/sync`, {
          companyId: catraca?.companyId,
          branchId: catraca?.branchId,
          catracaId: catraca?.id,
          type: "integration",
          data: [
            {
              success: true,
              data: {
                id,
              },
            },
          ],
        });
      }
    }

    logger.info("Integration >> Sincronização finalizada com sucesso.");
  } catch (err) {
    console.log(err);
    logger.error(
      "Integration >> Não foi possível sincronizar os dados com a catraca e banco de dados.",
      err?.response?.data || err?.message
    );
  }
};
