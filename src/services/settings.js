import { api } from "./api";

export const checkToken = async (clientToken, clientSecretToken) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/settings/validate-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientToken, clientSecretToken }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error validating token:", error);
    throw error;
  }
};

export async function fetchSettings() {
  try {
    const { data } = await api.get("/settings");
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export const getSettings = async () => {
  return await api.get("/settings");
};

export async function fetchSettingsAll() {
  try {
    const { data } = await api.get("/settings/all");
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export const printerValidateTokens = async (
  payload = {
    clientId: "",
    clientSecret: "",
  }
) => {
  return await api.post(`/settings/printers/validate-tokens`, payload);
};
