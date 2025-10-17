const capitalizeFirstLetter = (str) => {
  if (typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

function formatCNPJ(cnpj) {
  const cleaned = cnpj?.replace(/\D/g, "")?.padStart(14, "0");
  return (
    cleaned?.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    ) || "Não informado"
  );
}

function formatPhone(phone) {
  const cleaned = phone?.replace(/\D/g, "");

  if (cleaned.length === 11) {
    // Celular com DDD: (99) 99999-9999
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  if (cleaned.length === 10) {
    // Fixo com DDD: (99) 9999-9999
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }

  if (cleaned.length === 9) {
    // Celular sem DDD: 99999-9999
    return cleaned.replace(/^(\d{5})(\d{4})$/, "$1-$2");
  }

  if (cleaned.length === 8) {
    // Fixo sem DDD: 9999-9999
    return cleaned.replace(/^(\d{4})(\d{4})$/, "$1-$2");
  }

  // Retorna original se não couber em nenhum formato
  return phone || "-";
}

module.exports = {
  capitalizeFirstLetter,
  formatCNPJ,
  formatPhone,
};
