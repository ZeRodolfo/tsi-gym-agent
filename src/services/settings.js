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
