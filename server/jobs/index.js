const cron = require("node-cron");
const syncJob = require("./syncJob");
const syncEnrollmentsJob = require("./syncEnrollmentsJob");

module.exports = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Executando job de sincronização...");
    await syncJob();
  });

  cron.schedule("*/3 * * * *", async () => {
    console.log("Executando syncEnrollmentsJob de sincronização...");
    await syncEnrollmentsJob();
  });
};
