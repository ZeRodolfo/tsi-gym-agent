const cron = require("node-cron");
const logger = require("../utils/logger");
const syncJob = require("./syncJob");
const syncEnrollmentsJob = require("./syncEnrollmentsJob");

module.exports = () => {
  cron.schedule("*/5 * * * *", async () => {
    logger.info("Executando job de sincronização...");
    await syncJob();
  });

  cron.schedule("*/3 * * * *", async () => {
    logger.info("Executando syncEnrollmentsJob de sincronização...");
    await syncEnrollmentsJob();
  });
};
