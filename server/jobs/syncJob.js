const axios = require("axios");
const { AppDataSource } = require("../ormconfig");
const { Historic } = require("../entities/Historic");

const api = axios.create({
  baseURL: process.env.BASE_URL,
});

module.exports = async function job() {
  try {
    const repo = AppDataSource.getRepository(Historic);

    // Busca os não sincronizados
    const unsynced = await repo.find({ where: { synced: false } });

    if (unsynced.length === 0) {
      console.log("Nenhum histórico pendente para sincronizar.");
      return;
    }

    console.log(`Enviando ${unsynced.length} históricos...`);

    const items = [...unsynced];
    // Chama sua API (ajuste a URL)
    const response = await api.post(
      "/lessons-attendances/sync",
      items?.map(({ synced, ...item }) => item)
    );

    if (response.status === 201) {
      // Marca como sincronizado
      for (const history of unsynced) {
        history.synced = true;
      }
      await repo.save(unsynced);
      console.log("Históricos sincronizados com sucesso!");
    }
  } catch (error) {
    console.error("Erro ao sincronizar históricos:", error.message);
  }
};
