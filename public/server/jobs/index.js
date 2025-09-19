const cron = require("node-cron");
const syncJob = require("./syncJob");

console.log("HOST", process.env.BASE_URL);

module.exports = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Executando job de sincronização...");
    await syncJob();
  });
};
