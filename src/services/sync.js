import { api } from "services/api";

export async function fetchSync() {
  try {
    const { data } = await api.get("/sync");
    console.log('fim', data)
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function sendSyncHistoricAccess() {
  try {
    const { data } = await api.post("/sync");
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
