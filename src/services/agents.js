import { api } from "./api";

export const validateAgentTokens = async (payload) => {
  try {
    return await api.post(`/agents/validate-tokens`, payload);
  } catch (error) {
    console.error("Error saving devices:", error);
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

export const getAgent = async () => {
  return await api.get("/agents");
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
