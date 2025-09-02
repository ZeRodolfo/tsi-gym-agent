export const validateTokens = async (clientId, clientSecret) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/catracas/validate-tokens`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, clientSecret }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error validating token:", error);
    throw error;
  }
};
