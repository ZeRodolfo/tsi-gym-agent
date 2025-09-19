import { api } from "services/api";

export async function fetchHistoric() {
  try {
    const { data } = await api.get("/historic");
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function fetchHistoricLastAccess() {
  try {
    const { data } = await api.get("/historic/last-access");
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
