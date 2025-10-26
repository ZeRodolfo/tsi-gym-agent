const cron = require("node-cron");
const logger = require("../utils/logger");
const syncJob = require("./syncJob");
const syncEnrollmentsJob = require("./syncEnrollmentsJob");

let isSyncJobRunning = false;
let isSyncEnrollmentsRunning = false;

module.exports = () => {
  // cron.schedule("*/5 * * * *", async () => {
  //   logger.info("Executando job de sincronização...");
  //   await syncJob();
  // });

  // cron.schedule("*/3 * * * *", async () => {
  //   logger.info("Executando syncEnrollmentsJob de sincronização...");
  //   await syncEnrollmentsJob();
  // });

  // Executa a cada 20 segundos
  cron.schedule("*/5 * * * * *", async () => {
    if (isSyncJobRunning) {
      logger.warn(
        "⏩ Job de sincronização pulado (execução anterior ainda em andamento)"
      );
      return;
    }

    isSyncJobRunning = true;
    logger.info("🚀 Iniciando job de sincronização...");
    try {
      await syncJob();
      logger.info("✅ Job de sincronização finalizado com sucesso");
    } catch (err) {
      logger.error("❌ Erro no job de sincronização:", err);
    } finally {
      isSyncJobRunning = false;
    }
  });

  // Executa a cada 60 segundos também (ajuste se quiser outro intervalo)
  cron.schedule("*/60 * * * * *", async () => {
    if (isSyncEnrollmentsRunning) {
      logger.warn(
        "⏩ Job de syncEnrollments pulado (execução anterior ainda em andamento)"
      );
      return;
    }

    isSyncEnrollmentsRunning = true;
    logger.info("🚀 Iniciando syncEnrollmentsJob...");
    try {
      await syncEnrollmentsJob();
      logger.info("✅ syncEnrollmentsJob finalizado com sucesso");
    } catch (err) {
      logger.error("❌ Erro no syncEnrollmentsJob:", err);
    } finally {
      isSyncEnrollmentsRunning = false;
    }
  });
};
