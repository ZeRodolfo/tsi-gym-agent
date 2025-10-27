import { api } from "./api";

export async function fetchPrintersAll() {
  try {
    const { data } = await api.get("/printers/all");
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
