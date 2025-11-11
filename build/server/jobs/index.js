const cron = require("node-cron");
const logger = require("../utils/logger");
const syncJob = require("./syncJob");
const syncPeopleJob = require("./syncPeopleJob");
const syncTeachersJob = require("./syncTeachersJob");
const syncEmployeesJob = require("./syncEmployeesJob");
const syncEnrollmentsJob = require("./syncEnrollmentsJob");
const syncExistsEnrollmentsJob = require("./syncExistsEnrollmentsJob");

let isSyncPeopleJobRunning = false;
let isSyncTeachersJobRunning = false;
let isSyncEmployeesJobRunning = false;
let isSyncJobRunning = false;
let isSyncEnrollmentsRunning = false;
let isSyncExistsEnrollmentsRunning = false;

module.exports = () => {
  cron.schedule("*/5 * * * * *", async () => {
    if (isSyncPeopleJobRunning) {
      logger.warn(
        "⏩ Job de sincronização de pessoas pulado (execução anterior ainda em andamento)"
      );
      return;
    }

    isSyncPeopleJobRunning = true;
    logger.info("🚀 Iniciando job de sincronização de pessoas...");
    try {
      await syncPeopleJob();
      logger.info("✅ Job de sincronização de pessoas finalizado com sucesso");
    } catch (err) {
      logger.error("❌ Erro no job de sincronização de pessoas:", err);
    } finally {
      isSyncPeopleJobRunning = false;
    }
  });

  cron.schedule("*/5 * * * * *", async () => {
    if (isSyncTeachersJobRunning) {
      logger.warn(
        "⏩ Job de sincronização de professores pulado (execução anterior ainda em andamento)"
      );
      return;
    }

    isSyncTeachersJobRunning = true;
    logger.info("🚀 Iniciando job de sincronização de professores...");
    try {
      await syncTeachersJob();
      logger.info(
        "✅ Job de sincronização de professores finalizado com sucesso"
      );
    } catch (err) {
      logger.error("❌ Erro no job de sincronização de professores:", err);
    } finally {
      isSyncTeachersJobRunning = false;
    }
  });

  cron.schedule("*/5 * * * * *", async () => {
    if (isSyncEmployeesJobRunning) {
      logger.warn(
        "⏩ Job de sincronização de funcionários pulado (execução anterior ainda em andamento)"
      );
      return;
    }

    isSyncEmployeesJobRunning = true;
    logger.info("🚀 Iniciando job de sincronização de funcionários...");
    try {
      await syncEmployeesJob();
      logger.info(
        "✅ Job de sincronização de funcionários finalizado com sucesso"
      );
    } catch (err) {
      logger.error("❌ Erro no job de sincronização de funcionários:", err);
    } finally {
      isSyncEmployeesJobRunning = false;
    }
  });

  cron.schedule("*/5 * * * * *", async () => {
    if (isSyncEnrollmentsRunning) {
      logger.warn(
        "⏩ Job de sincronização de matrículas pulado (execução anterior ainda em andamento)"
      );
      return;
    }

    isSyncEnrollmentsRunning = true;
    logger.info("🚀 Iniciando job de sincronização de matrículas...");
    try {
      await syncEnrollmentsJob();
      logger.info(
        "✅ Job de sincronização de matrículas finalizado com sucesso"
      );
    } catch (err) {
      logger.error("❌ Erro no job de sincronização de matrículas:", err);
    } finally {
      isSyncEnrollmentsRunning = false;
    }
  });

  cron.schedule("0 0 */1 * * *", async () => {
    if (isSyncExistsEnrollmentsRunning) {
      logger.warn(
        "⏩ Job de exclusão de matrículas no banco principal pulado (execução anterior ainda em andamento)"
      );
      return;
    }

    isSyncExistsEnrollmentsRunning = true;
    logger.info(
      "🚀 Iniciando job de exclusão de matrículas no banco principal..."
    );
    try {
      await syncExistsEnrollmentsJob();
      logger.info(
        "✅ Job de exclusão de matrículas no banco principal finalizado com sucesso"
      );
    } catch (err) {
      logger.error(
        "❌ Erro no job de exclusão de matrículas no banco principal:",
        err
      );
    } finally {
      isSyncExistsEnrollmentsRunning = false;
    }
  });

  cron.schedule("*/60 * * * * *", async () => {
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
};
