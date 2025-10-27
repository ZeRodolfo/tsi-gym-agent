import { api } from "./api";

export const validateTokens = async (clientId, clientSecret, machine) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/catracas/validate-tokens`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machine, clientId, clientSecret }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error validating token:", error);
    throw error;
  }
};

export const checkTokens = async (
  payload = {
    clientId: "",
    clientSecret: "",
    machineKey: "",
    machineName: "PC Name",
  }
) => {
  return await api.post(`/catracas/validate-tokens`, payload);
};

export const getCatraca = async () => {
  try {
    const { data } = await api.get("/catracas");
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export async function fetchCatracasAll() {
  try {
    const { data } = await api.get("/catracas/all");
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
